import React from "react";

export default function Loader({ size = "md", color = "indigo" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  const colors = {
    indigo: "border-indigo-500",
    blue: "border-blue-500",
    purple: "border-purple-500",
    teal: "border-teal-500",
    green: "border-green-500",
    gray: "border-gray-400",
    white: "border-white",
  };

  const selectedColor = colors[color] || colors.indigo;

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizes[size]} ${selectedColor} border-t-transparent`}
      />
    </div>
  );
}
