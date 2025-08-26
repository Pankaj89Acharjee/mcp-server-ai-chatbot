import { Card, Progress, Skeleton } from "antd";
import React from "react";

export function AvailabilityPercentage({
  percentage,
  title,
  isLoading = false,
}) {
  return (
    <Card
      title={title ?? "Availability Percentage"}
      className="shadow-lg bg-slate-800 border-slate-700 text-white rounded-lg"
      headStyle={{ color: "white", borderBottom: "1px solid #475569" }}
    >
      <div className="flex justify-center items-center py-4">
        {isLoading ? (
          <Skeleton.Avatar active size={140} shape="circle" />
        ) : (
          <Progress
            type="circle"
            percent={percentage}
            strokeColor="#10b981"
            strokeWidth={6}
            size={140}
            format={(percent) => (
              <span className="text-4xl font-bold text-white">{percent}%</span>
            )}
          />
        )}
      </div>
    </Card>
  );
}
