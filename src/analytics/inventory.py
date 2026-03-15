"""Inventory insights."""
from __future__ import annotations

import numpy as np
import pandas as pd


def inventory_health(orders: pd.DataFrame, inventory: pd.DataFrame) -> pd.DataFrame:
    sales = orders.groupby("product_id")["quantity"].sum().reset_index(name="units_sold")
    merged = inventory.merge(sales, on="product_id", how="left").fillna({"units_sold": 0})
    merged["avg_daily_sales"] = merged["units_sold"] / 120
    merged["days_of_stock"] = np.where(merged["avg_daily_sales"] > 0, merged["stock_on_hand"] / merged["avg_daily_sales"], np.inf)
    merged["overstock"] = merged["stock_on_hand"] > (merged["weekly_orders"] * 4)
    merged["understock"] = merged["stock_on_hand"] < merged["safety_stock"]
    merged["refill_qty"] = np.maximum(0, merged["weekly_orders"] * 2 + merged["safety_stock"] - merged["stock_on_hand"])
    merged["auto_replenish"] = np.where(merged["understock"], "Trigger PO", "Monitor")
    return merged[
        [
            "product_id",
            "sku",
            "category",
            "stock_on_hand",
            "incoming_stock",
            "avg_daily_sales",
            "days_of_stock",
            "overstock",
            "understock",
            "refill_qty",
            "auto_replenish",
        ]
    ]
