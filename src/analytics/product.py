"""Product-level analytics and insights."""
from __future__ import annotations

from typing import Dict, Tuple

import numpy as np
import pandas as pd


def hero_zero_dashboard(orders: pd.DataFrame, products: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    # Merge with products, but exclude category from products if orders already has it
    merge_cols = ["product_id", "sku", "price", "rating"]
    if "category" not in orders.columns:
        merge_cols.append("category")
    
    merged = orders.merge(products[merge_cols], on="product_id", how="left", suffixes=("", "_product"))
    
    # Ensure category column exists - prefer from orders if present, otherwise from products
    if "category" not in merged.columns:
        if "category_product" in merged.columns:
            merged["category"] = merged["category_product"]
            merged = merged.drop(columns=["category_product"], errors="ignore")
        else:
            merged["category"] = "Unknown"
    elif "category_product" in merged.columns:
        # Drop the product category column since we're using the one from orders
        merged = merged.drop(columns=["category_product"], errors="ignore")
    
    # Drop any duplicate columns from merge (like sku if it exists in both)
    if "sku_product" in merged.columns:
        merged["sku"] = merged["sku_product"].fillna(merged.get("sku", ""))
        merged = merged.drop(columns=["sku_product"], errors="ignore")
    
    agg = (
        merged.groupby(["product_id", "sku", "category"])
        .agg(
            revenue=("revenue", "sum"),
            units=("quantity", "sum"),
            avg_price=("unit_price", "mean"),
            rating=("rating", "mean"),
        )
        .reset_index()
    )
    top = agg.sort_values("revenue", ascending=False).head(10)
    worst = agg.sort_values("revenue").head(10)
    dead_stock = agg.assign(turnover=agg["units"] / agg["avg_price"]).sort_values("units").head(10)
    return {"top": top, "worst": worst, "dead_stock": dead_stock}


def price_elasticity(orders: pd.DataFrame) -> pd.DataFrame:
    df = orders.copy()
    df["effective_price"] = df["unit_price"] * (1 - df["discount_rate"])
    elasticity = (
        df.groupby("product_id")
        .apply(lambda x: np.corrcoef(x["effective_price"], x["quantity"])[0, 1] if x["effective_price"].nunique() > 1 else 0)
        .rename("price_quantity_corr")
        .reset_index()
    )
    return elasticity


def sentiment_proxy(products: pd.DataFrame) -> pd.DataFrame:
    bins = pd.cut(products["rating"], bins=[0, 3, 4, 5], labels=["Negative", "Neutral", "Positive"])
    summary = products.assign(sentiment=bins).groupby(["category", "sentiment"]).size().unstack(fill_value=0)
    return summary


def seasonality(orders: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    df = orders.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df["month"] = df["order_date"].dt.month_name()
    df["weekday"] = df["order_date"].dt.day_name()
    monthly = df.groupby(["month", "category"])["revenue"].sum().unstack(fill_value=0)
    weekday = df.groupby(["weekday", "category"])["revenue"].sum().unstack(fill_value=0)
    festival = df.groupby(["festival", "category"])["revenue"].sum().unstack(fill_value=0)
    return {"monthly": monthly, "weekday": weekday, "festival": festival}


def repeat_purchase_rate(orders: pd.DataFrame) -> pd.DataFrame:
    repeat = (
        orders.groupby(["customer_id", "product_id"])["order_id"].count().reset_index(name="orders")
    )
    summary = repeat.groupby("product_id")["orders"].apply(lambda x: (x > 1).mean()).reset_index(name="repeat_rate")
    return summary


def inventory_velocity(orders: pd.DataFrame, inventory: pd.DataFrame) -> pd.DataFrame:
    sales = orders.groupby("product_id")["quantity"].sum().reset_index(name="units_sold")
    merged = inventory.merge(sales, on="product_id", how="left").fillna({"units_sold": 0})
    merged["avg_daily_sales"] = merged["units_sold"] / 120
    merged["days_to_sell_out"] = np.where(merged["avg_daily_sales"] > 0, merged["stock_on_hand"] / merged["avg_daily_sales"], np.inf)
    merged["status"] = np.where(merged["days_to_sell_out"] < 15, "🔥 Hot", np.where(merged["days_to_sell_out"] > 90, "🐢 Slow", "✅ Stable"))
    return merged[["product_id", "sku", "category", "stock_on_hand", "avg_daily_sales", "days_to_sell_out", "status"]]


def return_rate(orders: pd.DataFrame, returns: pd.DataFrame) -> pd.DataFrame:
    # Merge with suffixes to handle overlapping columns (both have product_id, customer_id)
    merged = orders.merge(returns, on="order_id", how="left", indicator=True, suffixes=("_order", "_return"))
    
    # Ensure product_id column exists - pandas may have added suffixes
    if "product_id_order" in merged.columns:
        merged["product_id"] = merged["product_id_order"]
    elif "product_id_x" in merged.columns:
        merged["product_id"] = merged["product_id_x"]
    elif "product_id_return" in merged.columns:
        merged["product_id"] = merged["product_id_return"]
    elif "product_id_y" in merged.columns:
        merged["product_id"] = merged["product_id_y"]
    elif "product_id" not in merged.columns:
        # Last resort: product_id should be in orders
        raise ValueError("product_id not found in merged dataframe after merge")
    
    rate = (
        merged.groupby("product_id")
        .agg(total_orders=("order_id", "count"), returns=("_merge", lambda x: (x == "both").sum()))
        .reset_index()
    )
    rate["return_rate"] = rate["returns"] / rate["total_orders"].clip(lower=1)
    return rate


def conversion_funnel(orders: pd.DataFrame) -> pd.DataFrame:
    funnel = (
        orders.groupby("product_id")
        .agg(page_views=("page_views", "sum"), cart_adds=("cart_adds", "sum"), purchases=("order_id", "count"))
        .reset_index()
    )
    funnel["cart_to_purchase"] = funnel["purchases"] / funnel["cart_adds"].clip(lower=1)
    funnel["view_to_cart"] = funnel["cart_adds"] / funnel["page_views"].clip(lower=1)
    return funnel


def cross_sell_matrix(orders: pd.DataFrame) -> pd.DataFrame:
    grouped = orders.groupby("order_id")["product_id"].apply(list)
    pairs = {}
    for items in grouped:
        unique = list(set(items))
        for i, a in enumerate(unique):
            for b in unique[i + 1 :]:
                key = tuple(sorted([a, b]))
                pairs[key] = pairs.get(key, 0) + 1
    data = [
        {"product_a": k[0], "product_b": k[1], "co_purchase": v}
        for k, v in sorted(pairs.items(), key=lambda x: x[1], reverse=True)
    ]
    return pd.DataFrame(data)


def discount_dependency(orders: pd.DataFrame) -> pd.DataFrame:
    summary = (
        orders.assign(discounted=orders["discount_rate"] > 0.05)
        .groupby(["product_id", "discounted"])["revenue"].sum()
        .unstack(fill_value=0)
        .reset_index()
        .rename(columns={False: "full_price_revenue", True: "discount_revenue"})
    )
    summary["dependency_score"] = summary["discount_revenue"] / (
        summary["full_price_revenue"] + summary["discount_revenue"]
    ).replace(0, np.nan)
    return summary


def complaint_detection(returns: pd.DataFrame) -> pd.DataFrame:
    return (
        returns.groupby("reason").agg(count=("return_id", "count"), avg_refund=("refund_amount", "mean")).sort_values("count", ascending=False)
    )
