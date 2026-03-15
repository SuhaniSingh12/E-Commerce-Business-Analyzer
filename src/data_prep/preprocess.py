"""Data loading, cleaning, splitting, and feature engineering utilities."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from src import config


@dataclass
class DatasetSplits:
    X_train: np.ndarray
    X_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    feature_names: list[str]
    scaler: StandardScaler | None = None


def load_datasets(data_dir: str | None = None) -> Dict[str, pd.DataFrame]:
    data_dir = config.DATA_DIR if data_dir is None else config.BASE_DIR / data_dir
    datasets = {}
    for name in ["products", "customers", "orders", "inventory", "deliveries", "returns", "traffic"]:
        path = data_dir / f"{name}.csv"
        if not path.exists():
            raise FileNotFoundError(f"Missing dataset: {path}")
        df = pd.read_csv(path)
        datasets[name] = df
    return datasets


def _fill_missing(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include=["float", "int"]).columns:
        df[col] = df[col].fillna(df[col].median())
    for col in df.select_dtypes(include=["object", "category"]).columns:
        df[col] = df[col].fillna(df[col].mode().iat[0])
    return df


def preprocess_products(df: pd.DataFrame) -> pd.DataFrame:
    df = _fill_missing(df.copy())
    df["price_scaled"] = np.log1p(df["price"])
    df["rating_sq"] = df["rating"] ** 2
    df["demand_marketing_interaction"] = df["demand_score"] * df["marketing_spend"]
    return df


def get_product_regression_data(df: pd.DataFrame, test_size: float = 0.2) -> DatasetSplits:
    feature_cols = [
        "price",
        "price_scaled",
        "rating",
        "rating_sq",
        "demand_score",
        "marketing_spend",
        "inventory_turnover",
        "demand_marketing_interaction",
    ]
    X = df[feature_cols].values
    y = df["sales"].values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=config.RANDOM_STATE
    )
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return DatasetSplits(X_train_scaled, X_test_scaled, y_train, y_test, feature_cols, scaler)


def preprocess_customers(df: pd.DataFrame) -> pd.DataFrame:
    df = _fill_missing(df.copy())
    df["loyalty_score"] = 0.4 * df["tenure_months"] + 0.6 * df["engagement_score"] * 10
    df["discount_sensitivity"] = df["discount_rate"] * (1 - df["engagement_score"])
    return df


def get_churn_data(df: pd.DataFrame, test_size: float = 0.25) -> DatasetSplits:
    feature_cols = [
        "age",
        "tenure_months",
        "monthly_spend",
        "engagement_score",
        "support_tickets",
        "avg_order_value",
        "visits_per_month",
        "discount_rate",
        "loyalty_score",
        "discount_sensitivity",
    ]
    X = df[feature_cols].values
    y = df["churn"].values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=config.RANDOM_STATE, stratify=y
    )
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return DatasetSplits(X_train_scaled, X_test_scaled, y_train, y_test, feature_cols, scaler)


def get_value_segment_data(df: pd.DataFrame, test_size: float = 0.25) -> DatasetSplits:
    feature_cols = [
        "monthly_spend",
        "avg_order_value",
        "visits_per_month",
        "engagement_score",
        "tenure_months",
        "loyalty_score",
    ]
    X = df[feature_cols].values
    y = df["value_segment"].astype(str).values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=config.RANDOM_STATE, stratify=y
    )
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return DatasetSplits(X_train_scaled, X_test_scaled, y_train, y_test, feature_cols, scaler)


def get_segmentation_features(df: pd.DataFrame) -> Tuple[np.ndarray, list[str]]:
    feature_cols = [
        "monthly_spend",
        "visits_per_month",
        "avg_order_value",
        "engagement_score",
        "tenure_months",
    ]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[feature_cols])
    return X_scaled, feature_cols


def preprocess_deliveries(df: pd.DataFrame, test_size: float = 0.2) -> DatasetSplits:
    df = _fill_missing(df.copy())
    feature_cols = ["distance_km", "traffic_index", "warehouse_load", "courier_rating"]
    X = df[feature_cols].values
    y = df["delivery_time"].values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=config.RANDOM_STATE
    )
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return DatasetSplits(X_train_scaled, X_test_scaled, y_train, y_test, feature_cols, scaler)
