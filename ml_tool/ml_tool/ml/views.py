import json

import os
from django.conf import settings
from django.core.files import File
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from django.core.files.uploadedfile import UploadedFile

import pandas as pd

from .models import Project
from .services import (
    apply_step3_preparation,
    build_step2_summary,
    validate_target_column,
)


def home(request):
    return render(request, "home.html")


def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "API working"
    })


def step2_summary(request, project_id):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET method is allowed."}, status=405)

    project = get_object_or_404(Project, id=project_id)

    try:
        summary = build_step2_summary(project)
        return JsonResponse(summary)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def step2_upload(request, project_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method is allowed."}, status=405)

    project = get_object_or_404(Project, id=project_id)

    uploaded: UploadedFile | None = request.FILES.get("file")
    if not uploaded:
        return JsonResponse({
            "error": "No file provided.",
            "banner": {
                "type": "error",
                "title": "Upload failed",
                "message": "Please choose a CSV file to upload."
            }
        }, status=400)

    name = uploaded.name or ""
    if not name.lower().endswith(".csv"):
        return JsonResponse({
            "error": "Only CSV files are allowed.",
            "banner": {
                "type": "error",
                "title": "Invalid file type",
                "message": "Please upload a .csv file (comma-separated values)."
            }
        }, status=400)

    max_bytes = 50 * 1024 * 1024
    if uploaded.size and uploaded.size > max_bytes:
        return JsonResponse({
            "error": "File is too large.",
            "banner": {
                "type": "error",
                "title": "File too large",
                "message": "The CSV must be 50 MB or smaller."
            }
        }, status=400)

    try:
        df = pd.read_csv(uploaded)
    except Exception:
        return JsonResponse({
            "error": "Could not parse CSV.",
            "banner": {
                "type": "error",
                "title": "Unreadable CSV",
                "message": "We couldn’t read this CSV. Ensure it is comma-separated with a header row."
            }
        }, status=400)

    if len(df) < 10:
        return JsonResponse({
            "error": "CSV must contain at least 10 rows.",
            "banner": {
                "type": "error",
                "title": "Not enough patients",
                "message": "Your CSV must contain at least 10 patient rows."
            }
        }, status=400)

    if df.select_dtypes(include=["number"]).shape[1] == 0:
        return JsonResponse({
            "error": "CSV must contain at least one numeric measurement column.",
            "banner": {
                "type": "error",
                "title": "No numeric measurements found",
                "message": "Your CSV needs at least one numeric measurement column (e.g., age, lab value)."
            }
        }, status=400)

    # Persist file to project and reset step-2 dependent state
    uploaded.seek(0)
    project.dataset_file.save(name, uploaded, save=False)
    project.schema_ok = False
    project.target_column = None
    project.current_step = 2
    project.save()

    try:
        summary = build_step2_summary(project)
        return JsonResponse(summary)
    except Exception as e:
        return JsonResponse({
            "error": str(e),
            "banner": {
                "type": "error",
                "title": "Upload processed but summary failed",
                "message": str(e)
            }
        }, status=400)


@csrf_exempt
def set_domain_dataset(request, project_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method is allowed."}, status=405)

    project = get_object_or_404(Project, id=project_id)

    try:
        data = json.loads(request.body)
        domain = data.get("domain")
        
        if not domain:
            return JsonResponse({"error": "No domain provided."}, status=400)

        safe_name = domain.replace("/", "_").replace(" ", "_") + ".csv"
        filepath = os.path.join(settings.BASE_DIR, 'default_datasets', safe_name)
        
        if not os.path.exists(filepath):
            return JsonResponse({"error": f"Default dataset for '{domain}' not found."}, status=404)
        
        with open(filepath, 'rb') as f:
            django_file = File(f)
            project.dataset_file.save(safe_name, django_file, save=False)
            project.schema_ok = False
            project.target_column = None
            project.current_step = 2
            project.save()

        summary = build_step2_summary(project)
        return JsonResponse(summary)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON body."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def column_mapper_save(request, project_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method is allowed."}, status=405)

    project = get_object_or_404(Project, id=project_id)

    try:
        data = json.loads(request.body)
        target_column = data.get("target_column")

        validation = validate_target_column(project, target_column)

        if not validation["valid"]:
            project.schema_ok = False
            project.save()

            return JsonResponse({
                "saved": False,
                "schema_ok": False,
                "banner": {
                    "type": "error",
                    "title": "Column Mapper validation failed",
                    "message": validation["message"]
                }
            }, status=400)

        project.target_column = target_column
        project.schema_ok = True
        project.current_step = 3
        project.save()

        return JsonResponse({
            "saved": True,
            "schema_ok": True,
            "banner": {
                "type": "success",
                "title": "Column Mapper saved",
                "message": "Target column saved successfully. Step 3 is now unlocked."
            },
            "target_column": project.target_column,
            "current_step": project.current_step
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON body."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def step3_apply(request, project_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method is allowed."}, status=405)

    project = get_object_or_404(Project, id=project_id)

    try:
        data = json.loads(request.body)

        missing_strategy = data.get("missing_strategy", "median")
        normalization_method = data.get("normalization_method", "zscore")
        train_ratio = int(data.get("train_ratio", 80))
        smote_enabled = bool(data.get("smote_enabled", False))

        if train_ratio < 50 or train_ratio > 90:
            return JsonResponse({
                "error": "train_ratio must be between 50 and 90."
            }, status=400)

        result = apply_step3_preparation(
            project=project,
            missing_strategy=missing_strategy,
            normalization_method=normalization_method,
            train_ratio=train_ratio,
            smote_enabled=smote_enabled,
        )

        if not result["allowed"]:
            return JsonResponse(result, status=403)

        return JsonResponse(result)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON body."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)