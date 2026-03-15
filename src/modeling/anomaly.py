"""Simple anomaly detection for abnormal orders."""
from __future__ import annotations

from typing import Dict

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_anomalies(orders: pd.DataFrame, contamination: float = 0.03) -> Dict[str, np.ndarray]:
    feature_cols = ["revenue", "quantity", "order_hour"]
    X = orders[feature_cols].copy()
    X["revenue_per_item"] = X["revenue"] / X["quantity"]
    model = IsolationForest(random_state=42, contamination=contamination)
    scores = model.fit_predict(X)
    anomalies = orders.loc[scores == -1, ["order_id", "customer_id", "revenue", "order_hour"]]
    return {"model": model, "anomalies": anomalies}
