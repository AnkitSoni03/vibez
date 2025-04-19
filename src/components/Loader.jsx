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
  const textColor = selectedColor.replace("border", "text");

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Container for spinner and glow effect */}
      <div className="relative mb-4">
        {/* Main spinner with shadow */}
        <div
          className={`animate-spin rounded-full ${sizes[size]} ${selectedColor} border-t-transparent shadow-md`}
        />
        
        {/* Outer glow effect */}
        <div 
          className={`absolute inset-0 rounded-full ${selectedColor.replace("border", "bg")} opacity-10 blur-sm`}
        />
      </div>
      
      {/* Text below the spinner */}
      <div className="text-center">
        <p className={`${textColor} text-sm font-medium`}>Loading...</p>
        <p className="text-gray-400 text-xs font-light">Please wait...!!</p>
      </div>
    </div>
  );
}