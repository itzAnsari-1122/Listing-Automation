import React, { forwardRef, useMemo } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

const ThemeButton = forwardRef(function ThemeButton(
  {
    children,
    loading = false,
    disabled = false,
    type = "button",
    buttonType = "button",
    variant = "contained",
    tone = "primary",
    size,
    textColor,
    borderRadius = "10px",
    className = "",
    loadingPosition = "start",
    sx: userSx,
    onClick,
    ...muiProps
  },
  ref
) {
  const muiVariant =
    variant === "outline"
      ? "outlined"
      : variant === "text"
      ? "text"
      : "contained";

  const toneMap = useMemo(() => {
    const map = {
      primary: {
        fg: "var(--color-primary-contrast, #ffffff)",
        bg: "var(--color-primary)",
        hoverBg: "var(--color-primary-600, rgba(59,130,246,0.92))",
        ring: "var(--color-primary-200, rgba(59,130,246,0.25))",
        border: "var(--color-primary)",
        text: "var(--color-primary)",
      },
      success: {
        fg: "var(--color-success-contrast, #ffffff)",
        bg: "var(--color-success)",
        hoverBg: "var(--color-success-600, rgba(16,185,129,0.92))",
        ring: "var(--color-success-200, rgba(16,185,129,0.25))",
        border: "var(--color-success)",
        text: "var(--color-success)",
      },
      danger: {
        fg: "var(--color-danger-contrast, #ffffff)",
        bg: "var(--color-danger)",
        hoverBg: "var(--color-danger-600, rgba(239,68,68,0.92))",
        ring: "var(--color-danger-200, rgba(239,68,68,0.25))",
        border: "var(--color-danger)",
        text: "var(--color-danger)",
      },
      neutral: {
        fg: "var(--color-text)",
        bg: "var(--color-surface)",
        hoverBg: "var(--color-surface-2, #6c6c6eff)",
        ring: "var(--color-shadow-light, rgba(0,0,0,0.06))",
        border: "var(--color-border, #545455ff)",
        text: "var(--color-border)",
      },
      surface: {
        fg: "var(--color-text)",
        bg: "var(--color-surface)",
        hoverBg: "var(--color-surface, #ffffffff)",
        ring: "var(--color-shadow-light, rgba(0,0,0,0.06))",
        border: "var(--color-surface, #ffffffff)",
        text: "var(--color-surface)",
      },
    };
    return map[tone] || map.primary;
  }, [tone]);

  const normalizeSize = (s, isIcon) => {
    if (!s) return isIcon ? undefined : "medium";
    if (s === "sm") return "small";
    if (s === "lg") return "large";
    if (s === "md") return "medium";
    return s;
  };

  const isDisabled = Boolean(disabled || loading || muiProps.disabled);

  const Spinner = (
    <svg
      className="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
      style={{
        color:
          muiVariant === "contained" ? textColor || toneMap.fg : toneMap.text,
      }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  const mergeSx = (base) => (userSx ? [base, userSx] : base);

  if (buttonType === "icon") {
    const iconSx = mergeSx({
      borderRadius: "9999px",
      minWidth: 40,
      width: 40,
      height: 40,
      color:
        muiVariant === "contained" ? textColor || toneMap.fg : toneMap.text,
      backgroundColor: muiVariant === "contained" ? toneMap.bg : "transparent",
      border:
        muiVariant === "outlined" ? `1px solid ${toneMap.border}` : "none",
      transition: "all 0.25s ease",
      opacity: isDisabled ? 0.5 : 1,
      pointerEvents: isDisabled ? "none" : "auto",
      "&:hover": {
        backgroundColor:
          muiVariant === "contained"
            ? toneMap.hoverBg
            : "var(--color-hover, rgba(0,0,0,0.04))",
        transform: isDisabled ? "none" : "scale(1.05)",
        boxShadow: isDisabled ? "none" : `0 0 0 6px ${toneMap.ring}`,
      },
      "&:focus-visible": {
        outline: "none",
        boxShadow: `0 0 0 4px ${toneMap.ring}`,
      },
    });

    return (
      <IconButton
        ref={ref}
        type={type}
        onClick={!isDisabled ? onClick : undefined}
        disabled={isDisabled}
        className={className}
        sx={iconSx}
        size={normalizeSize(size, true)}
        aria-busy={loading || undefined}
        {...muiProps}
      >
        {loading ? Spinner : null}
        {children}
      </IconButton>
    );
  }

  const baseTextColor =
    muiVariant === "contained" ? textColor || toneMap.fg : toneMap.text;

  const buttonSx = mergeSx({
    borderRadius,
    minWidth: 116,
    fontWeight: 700,
    letterSpacing: 0.2,
    color: baseTextColor,
    backgroundColor: muiVariant === "contained" ? toneMap.bg : "transparent",
    border: muiVariant === "outlined" ? `1px solid ${toneMap.border}` : "none",
    transition: "all 0.25s ease",
    opacity: isDisabled ? 0.6 : 1,
    pointerEvents: isDisabled ? "none" : "auto",
    "&:hover": {
      backgroundColor:
        muiVariant === "contained" ? toneMap.hoverBg : "transparent",
      borderColor: muiVariant === "outlined" ? toneMap.border : undefined,
      transform: isDisabled ? "none" : "translateY(-1px)",
      boxShadow: isDisabled ? "none" : `0 8px 18px ${toneMap.ring}`,
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 4px ${toneMap.ring}`,
    },
    position: loading && loadingPosition === "center" ? "relative" : undefined,
  });

  const content = (
    <>
      {loading && loadingPosition === "start" ? Spinner : null}
      {children}
      {loading && loadingPosition === "end" ? (
        <span className="ml-2">{Spinner}</span>
      ) : null}
      {loading && loadingPosition === "center" ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Spinner}
        </span>
      ) : null}
    </>
  );

  return (
    <Button
      ref={ref}
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      variant={muiVariant}
      size={normalizeSize(size, false)}
      className={className}
      sx={buttonSx}
      aria-busy={loading || undefined}
      {...muiProps}
    >
      {content}
    </Button>
  );
});

export default ThemeButton;
