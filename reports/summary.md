# E-Commerce Business Analyser Report

## Product Regression
| Model | MSE | RMSE | R² |
|---|---|---|---|
| linear | 2352.45 | 48.50 | 0.773 |
| polynomial | 9186.41 | 95.85 | 0.114 |

## Delivery Time Regression
| Model | MSE | RMSE | R² |
|---|---|---|---|
| linear | 25.29 | 5.03 | 0.863 |
| random_forest | 28.43 | 5.33 | 0.846 |

## Customer Churn Models
| Model | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| logistic_regression | 0.53 | 0.50 | 0.53 | 0.51 |
| svm | 0.58 | 0.56 | 0.58 | 0.56 |
| knn | 0.54 | 0.53 | 0.54 | 0.53 |
| naive_bayes | 0.58 | 0.58 | 0.58 | 0.58 |
| decision_tree | 0.53 | 0.52 | 0.53 | 0.52 |
| random_forest | 0.50 | 0.48 | 0.50 | 0.49 |

## Customer Value Models
| Model | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| logistic_regression | 0.86 | 0.87 | 0.86 | 0.86 |
| svm | 0.85 | 0.86 | 0.85 | 0.85 |
| knn | 0.74 | 0.75 | 0.74 | 0.74 |
| naive_bayes | 0.87 | 0.88 | 0.87 | 0.87 |
| decision_tree | 0.91 | 0.92 | 0.91 | 0.91 |
| random_forest | 0.93 | 0.94 | 0.93 | 0.93 |

## Clustering Summary
- Kmeans: {
"n_clusters": 4,
"noise_points": 0,
"silhouette": 0.20690217738869637
}
- Dbscan: {
"n_clusters": 4,
"noise_points": 279,
"silhouette": -0.1834238565309336
}

## Anomalies Detected
- Total anomalous orders: 90

## Visuals
- /Users/nareshyadav/Milestone_Project/artifacts/plots/product_regression.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/revenue_trend.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/order_heatmap.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/top_categories.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/inventory_turnover.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/customer_retention.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/churn_confusion.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/value_confusion.png
- /Users/nareshyadav/Milestone_Project/artifacts/plots/customer_clusters.png