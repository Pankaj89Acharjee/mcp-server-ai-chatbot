import React from "react";
import { Card } from "antd";
import { Link } from "react-router-dom";

/**
 * SummaryCard supports both navigation via `link` and interaction via `onClick`.
 * If `onClick` is provided, the card is wrapped in a clickable div; otherwise,
 * it uses a React Router Link for navigation.
 */
const SummaryCard = ({ title, value, unit, icon, cardClassName = "bg-slate-700 border-slate-600", link = "#", onClick }) => {
  const Wrapper = onClick ? "div" : Link;
  const wrapperProps = onClick ? { onClick, style: { cursor: "pointer" } } : { to: link };

  return (
    <Wrapper {...wrapperProps}>
      <Card
        className={`${cardClassName} text-white shadow-lg rounded-lg overflow-hidden`}
        bodyStyle={{
          padding: "8px",
          height: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Top Row: Icon + Title */}
        <div className="flex items-center w-full">
          {icon && (
            <span className="flex-shrink-0">
              {React.createElement(icon, {
                size: 24,
                className: "text-slate-400",
              })}
            </span>
          )}
          <p
            className="text-slate-300 text-xs font-medium truncate flex-grow min-w-0"
            title={title}
          >
            {title}
            {unit && ` (${unit})`}
          </p>
        </div>

        {/* Bottom: Value centered */}
        <div className="flex flex-grow items-center justify-center w-full">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </Card>
    </Wrapper>
  );
};

export default SummaryCard;
