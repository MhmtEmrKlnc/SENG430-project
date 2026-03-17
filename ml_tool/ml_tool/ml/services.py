import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from imblearn.over_sampling import SMOTE


def load_dataset(project):
    if not project.dataset_file:
        raise ValueError("No dataset file uploaded for this project.")

    file_path = project.dataset_file.path

    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    if file_path.endswith(".xlsx"):
        return pd.read_excel(file_path)

    raise ValueError("Unsupported file format. Only CSV and XLSX are allowed.")


def get_column_type(series):
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    return "categorical"


def build_step2_summary(project):
    df = load_dataset(project)

    columns = []
    numeric_columns = []
    categorical_columns = []

    for col in df.columns:
        col_type = get_column_type(df[col])

        if col_type == "numeric":
            numeric_columns.append(col)
        else:
            categorical_columns.append(col)

        columns.append({
            "name": col,
            "type": col_type,
            "missing": int(df[col].isnull().sum()),
            "unique_values": int(df[col].nunique(dropna=True)),
        })

    row_count = int(len(df))
    column_count = int(len(df.columns))
    missing_cells = int(df.isnull().sum().sum())
    target_candidates = list(df.columns)

    class_distribution = {}
    imbalance_warning = False

    if project.target_column and project.target_column in df.columns:
        target_counts = df[project.target_column].value_counts(dropna=False).to_dict()
        class_distribution = {str(k): int(v) for k, v in target_counts.items()}

        values = list(class_distribution.values())
        if len(values) >= 2 and min(values) > 0:
            ratio = max(values) / min(values)
            imbalance_warning = ratio > 1.5

    preview_data = df.head(5).to_dict(orient="records")

    return {
        "project_id": project.id,
        "project_name": project.name,
        "row_count": row_count,
        "column_count": column_count,
        "missing_cells": missing_cells,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "columns": columns,
        "target_candidates": target_candidates,
        "target_column": project.target_column,
        "schema_ok": project.schema_ok,
        "class_distribution": class_distribution,
        "imbalance_warning": imbalance_warning,
        "step3_unlocked": project.schema_ok,
        "preview_data": preview_data,
    }


def validate_target_column(project, target_column):
    df = load_dataset(project)

    if not target_column:
        return {
            "valid": False,
            "message": "Target column is required."
        }

    if target_column not in df.columns:
        return {
            "valid": False,
            "message": "Selected target column does not exist in dataset."
        }

    if df[target_column].isnull().all():
        return {
            "valid": False,
            "message": "Target column cannot be completely empty."
        }

    unique_count = df[target_column].nunique(dropna=True)

    if unique_count < 2:
        return {
            "valid": False,
            "message": "Target column must contain at least 2 classes."
        }

    return {
        "valid": True,
        "message": "Target column is valid."
    }


def handle_missing_values(df, strategy):
    df = df.copy()

    if strategy == "remove":
        return df.dropna()

    for col in df.columns:
        if df[col].isnull().sum() == 0:
            continue

        if pd.api.types.is_numeric_dtype(df[col]):
            if strategy == "median":
                df[col] = df[col].fillna(df[col].median())
            elif strategy == "mode":
                mode_series = df[col].mode(dropna=True)
                fill_value = mode_series.iloc[0] if not mode_series.empty else 0
                df[col] = df[col].fillna(fill_value)
            else:
                df[col] = df[col].fillna(df[col].median())
        else:
            mode_series = df[col].mode(dropna=True)
            fill_value = mode_series.iloc[0] if not mode_series.empty else "Unknown"
            df[col] = df[col].fillna(fill_value)

    return df


def normalize_numeric_data(X_train, method):
    X_train = X_train.copy()
    numeric_cols = X_train.select_dtypes(include=["number"]).columns.tolist()

    if method == "none" or not numeric_cols:
        return X_train, None, numeric_cols

    scaler = StandardScaler() if method == "zscore" else MinMaxScaler()
    X_train[numeric_cols] = scaler.fit_transform(X_train[numeric_cols])

    return X_train, scaler, numeric_cols


def build_normalization_chart_data(before_df, after_df, numeric_cols, limit=5):
    selected_cols = numeric_cols[:limit]
    before_data = []
    after_data = []

    for col in selected_cols:
        before_mean = float(round(before_df[col].mean(), 4))
        after_mean = float(round(after_df[col].mean(), 4))

        before_data.append({
            "feature": col,
            "value": before_mean
        })
        after_data.append({
            "feature": col,
            "value": after_mean
        })

    return before_data, after_data


def class_balance_to_chart(y_series):
    counts = y_series.value_counts(dropna=False).to_dict()
    return [{"label": str(k), "count": int(v)} for k, v in counts.items()]


def apply_step3_preparation(project, missing_strategy, normalization_method, train_ratio, smote_enabled):
    if not project.schema_ok:
        return {
            "allowed": False,
            "blocked_banner": {
                "type": "error",
                "title": "Step 3 is locked",
                "message": "Complete Column Mapper validation and save before accessing Step 3."
            }
        }

    df = load_dataset(project)

    if not project.target_column or project.target_column not in df.columns:
        return {
            "allowed": False,
            "blocked_banner": {
                "type": "error",
                "title": "Target column missing",
                "message": "Please save a valid target column in Column Mapper first."
            }
        }

    df = handle_missing_values(df, missing_strategy)

    if project.target_column not in df.columns:
        raise ValueError("Target column was lost during preprocessing.")

    y = df[project.target_column]
    X = df.drop(columns=[project.target_column])

    X = pd.get_dummies(X, drop_first=False)

    if len(X) < 10:
        raise ValueError("Dataset must contain at least 10 rows after preprocessing.")

    if X.select_dtypes(include=["number"]).shape[1] == 0:
        raise ValueError("Dataset must contain at least one numeric feature.")

    train_size = train_ratio / 100.0

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            train_size=train_size,
            random_state=42,
            stratify=y if y.nunique(dropna=True) > 1 else None
        )
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            train_size=train_size,
            random_state=42
        )

    before_norm_df = X_train.copy()

    X_train_norm, scaler, numeric_cols = normalize_numeric_data(X_train, normalization_method)
    after_norm_df = X_train_norm.copy()

    normalization_before, normalization_after = build_normalization_chart_data(
        before_norm_df,
        after_norm_df,
        numeric_cols
    )

    class_balance_before = class_balance_to_chart(y_train)
    class_balance_after = class_balance_before

    if smote_enabled:
        if y_train.nunique(dropna=True) < 2:
            raise ValueError("SMOTE requires at least 2 target classes in training data.")

        min_class_count = y_train.value_counts(dropna=True).min()
        
        if min_class_count <= 1:
            from imblearn.over_sampling import RandomOverSampler
            sampler = RandomOverSampler(random_state=42)
        else:
            k_neighbors = min(5, min_class_count - 1)
            sampler = SMOTE(sampling_strategy='auto', k_neighbors=k_neighbors, random_state=42)
            
        X_resampled, y_resampled = sampler.fit_resample(X_train_norm, y_train)
        y_train_after = pd.Series(y_resampled)
        class_balance_after = class_balance_to_chart(y_train_after)

    project.missing_strategy = missing_strategy
    project.normalization_method = normalization_method
    project.train_ratio = train_ratio
    project.smote_enabled = smote_enabled
    project.step3_completed = True
    project.current_step = 4
    project.save()

    return {
        "allowed": True,
        "success": True,
        "success_banner": {
            "type": "success",
            "title": "Preparation settings applied",
            "message": "Step 3 completed successfully. You can continue to Step 4."
        },
        "project": {
            "id": project.id,
            "current_step": project.current_step,
            "step3_completed": project.step3_completed,
        },
        "config": {
            "missing_strategy": missing_strategy,
            "normalization_method": normalization_method,
            "train_ratio": train_ratio,
            "smote_enabled": smote_enabled,
        },
        "charts": {
            "normalization_before": normalization_before,
            "normalization_after": normalization_after,
            "class_balance_before": class_balance_before,
            "class_balance_after": class_balance_after,
        },
        "test_size_rows": int(len(X_test)),
        "train_size_rows": int(len(X_train)),
    }