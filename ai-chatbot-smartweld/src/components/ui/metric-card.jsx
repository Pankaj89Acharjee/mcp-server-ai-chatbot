import { Card, Skeleton } from "antd";
import React from "react";

export function MetricCard({ title, value, subtitle, valueColor, isLoading }) {
  return (
    <Card title={title} className="dark-theme-card">
      {isLoading ? (
        <div className="flex flex-col items-start justify-center">
          <Skeleton.Input
            style={{ width: 100, height: 30, marginBottom: 8 }}
            active
          />
          <Skeleton.Input style={{ width: 60, height: 14 }} active />
        </div>
      ) : (
        <div className="flex flex-col items-start justify-center">
          <h2 className={`text-3xl font-bold ${valueColor}`}>{value}</h2>
          <p className="text-slate-300 text-sm">{subtitle}</p>
        </div>
      )}
    </Card>
  );
}
