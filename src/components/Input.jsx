import React, { forwardRef, useId } from "react";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      className = "",
      error = "",
      darkMode = true,
      ...props
    },
    ref
  ) => {
    const id = useId();

    return (
      <div className="w-full mb-4">
        {label && (
          <label
            htmlFor={id}
            className={`block mb-2 text-sm font-medium ${
              error
                ? "text-red-500"
                : darkMode
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={`
          w-full px-4 py-3 rounded-lg border
          ${
            darkMode
              ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
              : "bg-white text-black border-gray-300 focus:border-blue-500"
          }
          ${error ? "border-red-500" : ""}
          focus:ring-2 ${
            darkMode ? "focus:ring-indigo-900" : "focus:ring-blue-500"
          }
          outline-none transition-all duration-200
          ${className}
        `}
          ref={ref}
          id={id}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

export default Input;
