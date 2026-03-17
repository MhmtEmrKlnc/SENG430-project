import os
import pandas as pd
import numpy as np
from django.core.management.base import BaseCommand
from django.conf import settings

DOMAIN_METADATA = {
    "Cardiology": {"target": "DEATH_EVENT", "rows": 500, "classes": [0, 1]},
    "Radiology": {"target": "Finding Label", "rows": 800, "classes": ["Normal", "Pneumonia"]},
    "Nephrology": {"target": "classification", "rows": 400, "classes": ["ckd", "notckd"]},
    "Oncology - Breast": {"target": "diagnosis", "rows": 569, "classes": ["M", "B"]},
    "Neurology - Parkinson's": {"target": "status", "rows": 195, "classes": [0, 1]},
    "Endocrinology - Diabetes": {"target": "Outcome", "rows": 768, "classes": [0, 1]},
    "Hepatology - Liver": {"target": "Dataset", "rows": 583, "classes": ["Liver Disease", "No Liver Disease"]},
    "Cardiology - Stroke": {"target": "stroke", "rows": 5110, "classes": [0, 1]},
    "Mental Health": {"target": "severity class", "rows": 300, "classes": ["Mild", "Moderate", "Severe"]},
    "Pulmonology - COPD": {"target": "exacerbation", "rows": 400, "classes": ["Yes", "No"]},
    "Haematology - Anaemia": {"target": "anemia_type", "rows": 600, "classes": ["Iron Deficiency", "B12", "Normal"]},
    "Dermatology": {"target": "dx_type", "rows": 1000, "classes": ["Benign", "Malignant"]},
    "Ophthalmology": {"target": "severity grade", "rows": 1200, "classes": [0, 1, 2, 3, 4]},
    "Orthopaedics - Spine": {"target": "class", "rows": 310, "classes": ["Abnormal", "Normal"]},
    "ICU / Sepsis": {"target": "SepsisLabel", "rows": 1500, "classes": [0, 1]},
    "Obstetrics - Fetal Health": {"target": "fetal_health", "rows": 2126, "classes": [1, 2, 3]},
    "Cardiology - Arrhythmia": {"target": "arrhythmia", "rows": 452, "classes": [0, 1]},
    "Oncology - Cervical": {"target": "Biopsy", "rows": 858, "classes": [0, 1]},
    "Thyroid / Endocrinology": {"target": "class", "rows": 7200, "classes": ["hypo", "hyper", "normal"]},
    "Pharmacy - Readmission": {"target": "readmitted", "rows": 2000, "classes": ["<30", ">30", "NO"]},
}

class Command(BaseCommand):
    help = 'Generates default datasets for all 20 domains'

    def handle(self, *args, **kwargs):
        datasets_dir = os.path.join(settings.BASE_DIR, 'default_datasets')
        os.makedirs(datasets_dir, exist_ok=True)

        for domain, meta in DOMAIN_METADATA.items():
            rows = meta["rows"]
            target = meta["target"]
            classes = meta["classes"]
            
            np.random.seed(42)
            data = {
                "age": np.random.randint(18, 90, rows),
                "measurement_1": np.random.normal(50, 15, rows).round(2),
                "measurement_2": np.random.normal(120, 25, rows).round(2),
                "categorical_feature": np.random.choice(["A", "B", "C"], rows),
                target: np.random.choice(classes, rows, p=[0.7, 0.3][:len(classes)] if len(classes) == 2 else None)
            }
            
            mask = np.random.choice([True, False], rows, p=[0.05, 0.95])
            data["measurement_1"] = np.where(mask, np.nan, data["measurement_1"])

            df = pd.DataFrame(data)
            
            safe_name = domain.replace("/", "_").replace(" ", "_") + ".csv"
            filepath = os.path.join(datasets_dir, safe_name)
            
            df.to_csv(filepath, index=False)
            self.stdout.write(self.style.SUCCESS(f'Created {filepath}'))
