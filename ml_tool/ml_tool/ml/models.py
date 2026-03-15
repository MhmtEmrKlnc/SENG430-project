from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=255, default="Untitled Project")

    current_step = models.PositiveIntegerField(default=2)
    schema_ok = models.BooleanField(default=False)
    step3_completed = models.BooleanField(default=False)

    dataset_file = models.FileField(upload_to="datasets/", null=True, blank=True)
    target_column = models.CharField(max_length=255, null=True, blank=True)

    missing_strategy = models.CharField(max_length=50, default="median")
    normalization_method = models.CharField(max_length=50, default="zscore")
    train_ratio = models.PositiveIntegerField(default=80)
    smote_enabled = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id} - {self.name}"