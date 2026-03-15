"""Customer segmentation via K-Means and DBSCAN."""
from __future__ import annotations

from typing import Dict

import numpy as np
from sklearn.cluster import KMeans, DBSCAN

from src.evaluation.metrics import clustering_summary


def run_clustering(X: np.ndarray, eps: float = 0.8, min_samples: int = 10) -> Dict[str, Dict]:
    kmeans = KMeans(n_clusters=4, random_state=42)
    kmeans_labels = kmeans.fit_predict(X)

    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    dbscan_labels = dbscan.fit_predict(X)

    return {
        "kmeans": {
            "model": kmeans,
            "labels": kmeans_labels,
            "summary": clustering_summary(X, kmeans_labels),
        },
        "dbscan": {
            "model": dbscan,
            "labels": dbscan_labels,
            "summary": clustering_summary(X, dbscan_labels),
        },
    }
