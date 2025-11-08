import React from "react";

export default function MainCard({
  children,
  className = "",
  radius = "20px",
  bgColor = "var(--color-primary)",
  style = {},
  ...rest
}) {
  return (
    <div
      {...rest}
      className={`p-6 ${className}`}
      style={{
        backgroundColor: bgColor,
        color: "var(--color-text)",
        borderRadius: radius,
        boxShadow:
          "0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
