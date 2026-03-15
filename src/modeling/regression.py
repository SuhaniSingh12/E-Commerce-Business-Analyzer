"""Regression models for product sales and delivery analytics."""
from __future__ import annotations

from pathlib import Path
from typing import Dict

import joblib
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.ensemble import RandomForestRegressor

from src.evaluation.metrics import regression_report, RegressionReport


ModelResult = Dict[str, Dict[str, object]]


def save_model(model, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)


def run_product_regression(splits, degree: int = 2) -> ModelResult:
    linear = LinearRegression()
    linear.fit(splits.X_train, splits.y_train)
    y_pred_linear = linear.predict(splits.X_test)
    linear_report = regression_report(splits.y_test, y_pred_linear)

    poly_model = Pipeline(
        [
            ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
            ("reg", LinearRegression()),
        ]
    )
    poly_model.fit(splits.X_train, splits.y_train)
    y_pred_poly = poly_model.predict(splits.X_test)
    poly_report = regression_report(splits.y_test, y_pred_poly)

    return {
        "linear": {"model": linear, "report": linear_report},
        "polynomial": {"model": poly_model, "report": poly_report},
    }


def run_delivery_regression(splits) -> Dict[str, Dict[str, RegressionReport]]:
    linear = LinearRegression().fit(splits.X_train, splits.y_train)
    rf = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=1).fit(
        splits.X_train, splits.y_train
    )

    linear_pred = linear.predict(splits.X_test)
    rf_pred = rf.predict(splits.X_test)

    return {
        "linear": {"model": linear, "report": regression_report(splits.y_test, linear_pred)},
        "random_forest": {"model": rf, "report": regression_report(splits.y_test, rf_pred)},
    }
