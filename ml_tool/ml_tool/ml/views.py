import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt

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