"""Visualization helpers for the E-Commerce Business Analyser."""
from __future__ import annotations

from pathlib import Path
from typing import Dict

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src import config

sns.set_theme(style="whitegrid")


def _prepare_output(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def plot_regression_comparison(y_true, predictions: Dict[str, np.ndarray], title: str, filename: str) -> Path:
    plt.figure(figsize=(8, 5))
    plt.scatter(y_true, y_true, label="Actual", alpha=0.4)
    for name, y_pred in predictions.items():
        plt.scatter(y_true, y_pred, label=name.title(), alpha=0.6)
    plt.xlabel("Actual Sales")
    plt.ylabel("Predicted Sales")
    plt.title(title)
    plt.legend()
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_revenue_trend(orders: pd.DataFrame, filename: str = "revenue_trend.png") -> Path:
    orders = orders.copy()
    orders["order_date"] = pd.to_datetime(orders["order_date"])
    revenue_daily = orders.groupby("order_date")["revenue"].sum()
    plt.figure(figsize=(10, 4))
    revenue_daily.rolling(7).mean().plot()
    plt.title("Rolling 7-day Revenue")
    plt.ylabel("Revenue")
    plt.xlabel("Date")
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_order_heatmap(orders: pd.DataFrame, filename: str = "order_heatmap.png") -> Path:
    orders = orders.copy()
    orders["order_date"] = pd.to_datetime(orders["order_date"])
    orders["weekday"] = orders["order_date"].dt.day_name().str[:3]
    pivot = orders.pivot_table(index="weekday", columns="order_hour", values="order_id", aggfunc="count")
    pivot = pivot.reindex(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    plt.figure(figsize=(12, 4))
    sns.heatmap(pivot, cmap="YlOrRd")
    plt.title("Order Volume Heatmap")
    plt.xlabel("Hour of Day")
    plt.ylabel("Weekday")
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_top_categories(orders: pd.DataFrame, products: pd.DataFrame, filename: str = "top_categories.png") -> Path:
    merged = orders.merge(products[["product_id", "category"]], on="product_id", how="left")
    cat_rev = merged.groupby("category")["revenue"].sum().sort_values(ascending=False)
    plt.figure(figsize=(8, 4))
    sns.barplot(x=cat_rev.values, y=cat_rev.index, palette="viridis")
    plt.title("Top Selling Categories")
    plt.xlabel("Revenue")
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_confusion_matrix(cm: np.ndarray, labels: list[str], title: str, filename: str) -> Path:
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title(title)
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_clusters(X: np.ndarray, labels: np.ndarray, title: str, filename: str) -> Path:
    plt.figure(figsize=(6, 5))
    scatter = plt.scatter(X[:, 0], X[:, 1], c=labels, cmap="tab10", alpha=0.7)
    plt.title(title)
    plt.xlabel("Feature 1 (standardized)")
    plt.ylabel("Feature 2 (standardized)")
    plt.legend(*scatter.legend_elements(), title="Cluster")
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_inventory_turnover(inventory: pd.DataFrame, filename: str = "inventory_turnover.png") -> Path:
    inventory_sorted = inventory.sort_values("inventory_turnover", ascending=False).head(20)
    plt.figure(figsize=(10, 4))
    sns.barplot(data=inventory_sorted, x="product_id", y="inventory_turnover", hue="category", dodge=False)
    plt.xticks(rotation=90)
    plt.title("Fast vs Slow Moving Products")
    plt.ylabel("Inventory Turnover")
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path


def plot_retention(customers: pd.DataFrame, filename: str = "customer_retention.png") -> Path:
    buckets = pd.cut(customers["tenure_months"], bins=[0, 6, 12, 24, 36, 60], labels=["<6", "6-12", "12-24", "24-36", "36+"])
    retention = customers.groupby(buckets)["churn"].mean()
    plt.figure(figsize=(6, 4))
    retention = (1 - retention).fillna(0)
    sns.barplot(x=retention.index.astype(str), y=retention.values, palette="crest")
    plt.ylim(0, 1)
    plt.ylabel("Retention Rate")
    plt.title("Customer Retention by Tenure")
    path = _prepare_output(config.PLOT_DIR / filename)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return path
