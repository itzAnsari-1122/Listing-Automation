import { EyeClosed, EyeClosedIcon, EyeIcon, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Controller } from "react-hook-form";

export default function ThemeTextField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className = "",
  error,
  isController = false,
  control,
  rules = {},
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";

  const renderInput = (fieldProps = {}) => (
    <div className="relative">
      <input
        id={name}
        type={isPasswordType && !showPassword ? "password" : "text"}
        name={name}
        value={fieldProps.value ?? value}
        onChange={fieldProps.onChange ?? onChange}
        placeholder={placeholder}
        {...rest}
        className={`
          w-full rounded-md px-3 py-2 outline-none transition
          focus:ring-2 focus:ring-[var(--color-primary)]
          ${error ? "border-red-500" : ""}
        `}
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
          border: `1px solid ${error ? "red" : "var(--color-primary)"}`,
        }}
      />

      {isPasswordType && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-sm text-[var(--color-text)] hover:text-[var(--color-primary)]
            focus:outline-none
          "
        >
          {showPassword ? <EyeIcon /> : <EyeOff />}
        </button>
      )}
    </div>
  );

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {label}
        </label>
      )}

      {isController && control ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => renderInput(field)}
        />
      ) : (
        renderInput()
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
