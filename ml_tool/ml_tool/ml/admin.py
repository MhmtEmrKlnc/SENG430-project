from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "current_step",
        "schema_ok",
        "step3_completed",
        "target_column",
        "created_at",
    )
    list_filter = ("schema_ok", "step3_completed", "normalization_method", "smote_enabled")
    search_fields = ("name", "target_column")