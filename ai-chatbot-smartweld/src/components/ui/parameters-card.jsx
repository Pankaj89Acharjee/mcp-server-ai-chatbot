import { Card, Skeleton } from "antd";
import React from "react";

export function ParametersCard({ title, parameters, isLoading }) {
  return (
    <Card title={title} className="dark-theme-card">
      {isLoading ? (
        <div className="flex flex-col items-start justify-center">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex justify-between w-full mb-2">
              <Skeleton title={{ width: 100 }} active paragraph={false} />
              <Skeleton title={{ width: 50 }} active paragraph={false} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start justify-center">
          {parameters.map((param, index) => (
            <div key={index} className="flex justify-between w-full mb-2">
              <span className="text-slate-300">{param.label}</span>
              <span className="font-semibold">{param.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
