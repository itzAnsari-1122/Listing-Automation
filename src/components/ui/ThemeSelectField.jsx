import React, { useState, useRef, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Check, ChevronDown, XCircle, PlusCircle } from "lucide-react";

const getFlagUrl = (code) =>
  `https://flagcdn.com/w20/${code?.toLowerCase()}.png`;

export default function ThemeSelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  error,
  helperText,
  multiple = false,
  isController = false,
  control,
  rules = {},
  disabled = false,
  readOnly = false,
  width = "250px",
  borderRadius,
  countriesFlags = false,
  ...rest
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderSelect = (fieldProps = {}) => {
    const selectedValue = fieldProps.value ?? value ?? (multiple ? [] : "");
    const selectedOption = !multiple
      ? options.find((o) => o.value === selectedValue)
      : null;

    const handleOptionToggle = (optionValue) => {
      if (multiple) {
        const sv = Array.isArray(selectedValue) ? selectedValue : [];
        const newValues = sv.includes(optionValue)
          ? sv.filter((v) => v !== optionValue)
          : [...sv, optionValue];
        const newPayload = newValues.map((v) =>
          options.find((o) => o.value === v),
        );
        (fieldProps.onChange || onChange)?.(newValues, newPayload);
      } else {
        fieldProps.onChange
          ? fieldProps.onChange(optionValue)
          : onChange && onChange(optionValue);
        setOpen(false);
      }
    };

    const handleSelectAll = () => {
      const sv = Array.isArray(selectedValue) ? selectedValue : [];
      if (sv.length === options.length) {
        fieldProps.onChange
          ? fieldProps.onChange([])
          : onChange && onChange([]);
      } else {
        const allValues = options.map((opt) => opt.value);
        fieldProps.onChange
          ? fieldProps.onChange(allValues)
          : onChange && onChange(allValues);
      }
    };

    const selectedLabels = multiple
      ? options
          .filter((opt) =>
            (Array.isArray(selectedValue) ? selectedValue : []).includes(
              opt.value,
            ),
          )
          .map((opt) => opt.label)
          .join(", ")
      : selectedOption?.label || "";

    const isAllSelected =
      multiple &&
      Array.isArray(selectedValue) &&
      selectedValue.length === options.length &&
      options.length > 0;

    return (
      <div className="relative" ref={dropdownRef} style={{ width }}>
        <div
          className={`flex w-full cursor-pointer items-center justify-between overflow-hidden border px-3 py-2 transition-all duration-150
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
            ${borderRadius ? "" : "rounded-lg"} // Only apply if no custom borderRadius rounded-lg
          `}
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            border: `1px solid ${
              error ? "var(--color-error)" : "var(--color-primary)"
            }`,
            boxShadow: error
              ? "0 0 0 2px var(--color-error)"
              : "0 0 0 2px transparent",
            borderRadius: borderRadius, // Apply custom border radius if provided
          }}
          onClick={() => !disabled && setOpen((prev) => !prev)}
        >
          <div className="flex flex-1 items-center gap-2 truncate text-sm">
            {multiple ? (
              Array.isArray(selectedValue) && selectedValue.length > 0 ? (
                <div className="flex flex-wrap gap-1 overflow-hidden">
                  {options
                    .filter((opt) => selectedValue.includes(opt.value))
                    .slice(0, 3)
                    .map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center gap-1 truncate rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs"
                        style={{ borderRadius: borderRadius }} // Apply same borderRadius to chips
                      >
                        {(opt.code && label?.toLowerCase() === "country") ||
                          (countriesFlags && (
                            <img
                              src={getFlagUrl(opt.code)}
                              alt={`${opt.label} flag`}
                              className="h-3 w-4 rounded-sm"
                            />
                          ))}
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  {selectedValue.length > 3 && (
                    <span className="text-xs opacity-70">
                      +{selectedValue.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="opacity-60">{placeholder}</span>
              )
            ) : selectedLabels ? (
              <>
                {(selectedOption?.code && label?.toLowerCase() === "country") ||
                  (countriesFlags === true && (
                    <img
                      src={getFlagUrl(selectedOption.code)}
                      alt={`${selectedOption.label} flag`}
                      className="h-4 w-5 rounded-sm"
                    />
                  ))}
                <span>{selectedLabels}</span>
              </>
            ) : (
              <span className="opacity-60">{placeholder}</span>
            )}
          </div>

          {multiple && options.length > 0 && (
            <div
              className="ml-2 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
            >
              {isAllSelected ? (
                <XCircle
                  className="h-4 w-4 text-[var(--color-error)] transition hover:opacity-80"
                  title="Clear all"
                />
              ) : (
                <PlusCircle
                  className="h-4 w-4 text-[var(--color-primary)] transition hover:opacity-80"
                  title="Select all"
                />
              )}
            </div>
          )}

          <ChevronDown
            className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            style={{ color: "var(--color-icon)" }}
          />
        </div>

        {open && (
          <div
            className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto border shadow-md"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-primary)",
              boxShadow: `0 4px 10px var(--color-shadow-heavy)`,
              borderRadius: borderRadius, // Apply same borderRadius to dropdown
            }}
          >
            {options.length > 0 ? (
              options.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(selectedValue) &&
                    selectedValue.includes(option.value)
                  : selectedValue === option.value;

                return (
                  <div
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-[var(--color-bg)]
                      ${isSelected ? "bg-[var(--color-bg)]" : ""}
                    `}
                    onClick={() => handleOptionToggle(option.value)}
                    title={option.label}
                  >
                    {multiple && (
                      <div
                        className={`flex h-4 w-4 items-center justify-center border transition-all duration-150 ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                            : "border-[var(--color-primary)]"
                        }`}
                        style={{ borderRadius: borderRadius }} // Apply same borderRadius to checkboxes
                      >
                        {isSelected && (
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    )}

                    {(option.code && label?.toLowerCase() === "country") ||
                      (countriesFlags && (
                        <img
                          src={getFlagUrl(option.code)}
                          alt={`${option.label} flag`}
                          className="h-4 w-5 rounded-sm"
                        />
                      ))}

                    <span className="truncate text-sm">{option.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm opacity-70">No options</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-4" style={{ width }}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block truncate text-sm font-medium"
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
          render={({ field }) => renderSelect(field)}
        />
      ) : (
        renderSelect()
      )}

      {(error || helperText) && (
        <p
          className="mt-1 truncate text-xs"
          style={{ color: error ? "var(--color-error)" : "var(--color-text)" }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
