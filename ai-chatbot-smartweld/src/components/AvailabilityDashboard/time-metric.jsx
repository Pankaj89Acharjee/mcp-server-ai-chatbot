import { Card, Skeleton } from "antd";
import React from "react";

export function TimeMetric({
  title,
  hours,
  subtitle,
  color,
  isLoading = false,
}) {
  return (
    <Card
      title={title}
      className="shadow-lg bg-slate-800 border-slate-700 text-white rounded-lg"
      headStyle={{ color: "white", borderBottom: "1px solid #475569" }}
    >
      {isLoading ? (
        <div className="flex flex-col items-start justify-center h-40">
          <Skeleton.Input style={{ width: 100, height: 36 }} active />
          <Skeleton.Input
            style={{ width: 150, height: 14, marginTop: 8 }}
            active
          />
        </div>
      ) : (
        <div className="flex flex-col items-start justify-center h-40">
          <h2 className={`text-3xl font-bold ${color}`}>{hours} hours</h2>
          <p className="text-slate-300 mt-2 text-sm">{subtitle}</p>
        </div>
      )}
    </Card>
  );
}
