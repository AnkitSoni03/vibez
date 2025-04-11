import React, { useId } from "react";

const Select = React.forwardRef(function Select(
  { options, label, className = "", error, darkMode = true, ...props },
  ref
) {
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
      <select
        id={id}
        ref={ref}
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
        {...props}
      >
        {options?.map((option) => (
          <option
            key={option.value || option}
            value={option.value || option}
            className={darkMode ? "bg-gray-700" : "bg-white"}
          >
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
