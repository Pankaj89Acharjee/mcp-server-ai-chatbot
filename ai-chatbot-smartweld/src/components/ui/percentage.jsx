import { Card, Progress, Skeleton } from "antd";
import React from "react";

export function Percentage({ percentage, title, color, isLoading }) {
  return (
    <Card
      title={title ?? "Percentage"}
      className="shadow-lg h-full bg-slate-800 border-slate-700 text-white rounded-lg"
      headStyle={{ color: "white", borderBottom: "1px solid #475569" }}
      bodyStyle={{
        padding: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-2">
          <Skeleton.Avatar active size={120} shape="circle" />
        </div>
      ) : (
        <div className="flex justify-center items-center py-2">
          <Progress
            type="circle"
            percent={percentage}
            strokeColor={color ?? "#10b981"}
            strokeWidth={6}
            size={120}
            format={(percent) => (
              <span className="text-3xl font-bold text-green-500">
                {percent}%
              </span>
            )}
          />
        </div>
      )}
    </Card>
  );
}
