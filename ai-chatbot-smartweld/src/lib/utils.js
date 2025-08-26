import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date, type) => {
  if (type === "range" && Array.isArray(date)) {
    return JSON.stringify({
      startDate: date[0].format("YYYY-MM-DD"),
      endDate: date[1].format("YYYY-MM-DD"),
    });
  }
  return JSON.stringify(date.format("YYYY-MM-DD"));
};
