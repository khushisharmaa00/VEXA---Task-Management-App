import React from "react";
import clsx from "clsx";

const Textbox = React.forwardRef(
  (
    {
      type,
      placeholder,
      label,
      className,
      register,
      name,
      value,
      onChange,
      error,
    },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div>
          <input
            type={type}
            name={name}
            value={value} // Controlled input
            onChange={onChange}
            placeholder={placeholder}
            ref={ref}
            {...register}
            aria-invalid={error ? "true" : "false"}
            className={clsx(
              "block w-full rounded-md border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              "py-2 px-3 shadow-sm focus:outline-none focus:ring-2",
              "focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent",
              "sm:text-sm",
              className
            )}
          />
        </div>
        {error && (
          <span className="text-xs text-red-500 dark:text-red-400 mt-0.5 ">
            {error}
          </span>
        )}
      </div>
    );
  }
);
export default Textbox;
