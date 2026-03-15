"""Metric utilities for regression, classification, and clustering."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

import numpy as np
from sklearn import metrics


@dataclass
class RegressionReport:
    mse: float
    rmse: float
    r2: float


@dataclass
class ClassificationReport:
    accuracy: float
    precision: float
    recall: float
    f1: float
    confusion_matrix: np.ndarray


def regression_report(y_true: np.ndarray, y_pred: np.ndarray) -> RegressionReport:
    mse = metrics.mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = metrics.r2_score(y_true, y_pred)
    return RegressionReport(mse, rmse, r2)


def classification_report(y_true: np.ndarray, y_pred: np.ndarray) -> ClassificationReport:
    accuracy = metrics.accuracy_score(y_true, y_pred)
    precision = metrics.precision_score(y_true, y_pred, average="weighted", zero_division=0)
    recall = metrics.recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1 = metrics.f1_score(y_true, y_pred, average="weighted", zero_division=0)
    cm = metrics.confusion_matrix(y_true, y_pred)
    return ClassificationReport(accuracy, precision, recall, f1, cm)


def clustering_summary(X: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
    unique_labels = set(labels)
    noise_count = sum(1 for label in labels if label == -1)
    silhouette = metrics.silhouette_score(X, labels) if len(unique_labels) > 1 else float("nan")
    return {
        "n_clusters": len(unique_labels) - (1 if -1 in unique_labels else 0),
        "noise_points": noise_count,
        "silhouette": silhouette,
    }
