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
        let newValues;

        if (sv.includes(optionValue)) {
          // Remove the option
          newValues = sv.filter((v) => v !== optionValue);
        } else {
          // Add the option
          newValues = [...sv, optionValue];
        }

        // Create payload with the actual selected options
        const newPayload = options.filter((opt) =>
          newValues.includes(opt.value),
        );

        if (fieldProps.onChange) {
          fieldProps.onChange(newValues);
        } else if (onChange) {
          onChange(newValues, newPayload);
        }
      } else {
        const selectedOption = options.find((o) => o.value === optionValue);
        if (fieldProps.onChange) {
          fieldProps.onChange(optionValue);
        } else if (onChange) {
          onChange(optionValue, selectedOption);
        }
        setOpen(false);
      }
    };

    const handleSelectAll = () => {
      const sv = Array.isArray(selectedValue) ? selectedValue : [];
      if (sv.length === options.length) {
        // Clear all
        if (fieldProps.onChange) {
          fieldProps.onChange([]);
        } else if (onChange) {
          onChange([], []);
        }
      } else {
        // Select all
        const allValues = options.map((opt) => opt.value);
        if (fieldProps.onChange) {
          fieldProps.onChange(allValues);
        } else if (onChange) {
          onChange(allValues, options);
        }
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

    const isSomeSelected =
      multiple &&
      Array.isArray(selectedValue) &&
      selectedValue.length > 0 &&
      selectedValue.length < options.length;

    return (
      <div className="relative" ref={dropdownRef} style={{ width }}>
        <div
          className={`flex w-full cursor-pointer items-center justify-between overflow-hidden border px-3 py-2 transition-all duration-150
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
            ${borderRadius ? "" : "rounded-lg"}
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
            borderRadius: borderRadius,
          }}
          onClick={() => !disabled && !readOnly && setOpen((prev) => !prev)}
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
                        style={{ borderRadius: borderRadius }}
                      >
                        {countriesFlags && (
                          <img
                            src={getFlagUrl(opt.code)}
                            alt={`${opt.label} flag`}
                            className="h-3 w-4 rounded-sm"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <span>{opt.label}</span>
                        {!readOnly && (
                          <button
                            type="button"
                            className="ml-1 hover:text-[var(--color-error)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionToggle(opt.value);
                            }}
                          >
                            ×
                          </button>
                        )}
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
                {countriesFlags && selectedOption?.code && (
                  <img
                    src={getFlagUrl(selectedOption.code)}
                    alt={`${selectedOption.label} flag`}
                    className="h-4 w-5 rounded-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <span>{selectedLabels}</span>
              </>
            ) : (
              <span className="opacity-60">{placeholder}</span>
            )}
          </div>

          {multiple && options.length > 0 && !readOnly && (
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
              ) : isSomeSelected ? (
                <div
                  className="h-4 w-4 rounded-sm border border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-50"
                  title="Some selected"
                />
              ) : (
                <PlusCircle
                  className="h-4 w-4 text-[var(--color-primary)] transition hover:opacity-80"
                  title="Select all"
                />
              )}
            </div>
          )}

          {!readOnly && (
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              style={{ color: "var(--color-icon)" }}
            />
          )}
        </div>

        {open && !readOnly && (
          <div
            className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto border shadow-md"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-primary)",
              boxShadow: `0 4px 10px var(--color-shadow-heavy)`,
              borderRadius: borderRadius,
            }}
          >
            {options.length > 0 ? (
              <>
                {multiple && options.length > 1 && (
                  <div
                    className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 transition-colors hover:bg-[var(--color-bg)]"
                    onClick={handleSelectAll}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center border transition-all duration-150 ${
                        isAllSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : isSomeSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-50"
                            : "border-[var(--color-primary)]"
                      }`}
                      style={{ borderRadius: borderRadius }}
                    >
                      {(isAllSelected || isSomeSelected) && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-sm">
                      {isAllSelected ? "Deselect All" : "Select All"}
                    </span>
                  </div>
                )}
                {options.map((option) => {
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
                          style={{ borderRadius: borderRadius }}
                        >
                          {isSelected && (
                            <Check
                              className="h-3 w-3 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      )}

                      {countriesFlags && (
                        <img
                          src={getFlagUrl(option.code)}
                          alt={`${option.label} flag`}
                          className="h-4 w-5 rounded-sm"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}

                      <span className="truncate text-sm">{option.label}</span>
                    </div>
                  );
                })}
              </>
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
