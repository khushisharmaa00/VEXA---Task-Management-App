import clsx from "clsx";
import React from "react";

const Button = ({ icon, className, label, type, onClick = () => {} }) => {
  return (
    <button
      type={type || "button"}
      className={clsx(
        "px-3 py-2 outline-none dark:text-gray-100",
        className,
        !className?.includes("bg-") &&
          "hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      {icon && icon}
    </button>
  );
};

export default Button;
