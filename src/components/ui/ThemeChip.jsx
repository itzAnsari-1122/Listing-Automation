import React, { forwardRef, useMemo } from "react";
import Chip from "@mui/material/Chip";

const ThemeChip = forwardRef(function ThemeChip(
  {
    label,
    loading = false,
    disabled = false,
    variant = "filled",
    tone = "primary",
    size,
    textColor,
    borderRadius = 9999,
    startIcon,
    endIcon,
    className = "",
    sx: userSx,
    clickable,
    onClick,
    onDelete,
    ...muiProps
  },
  ref
) {
  const muiVariant = variant === "outline" ? "outlined" : "filled";
  const isDisabled = Boolean(disabled || loading || muiProps.disabled);

  const { color: _ignoredColor, ...restMuiProps } = muiProps;

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
    };
    return map[tone] || map.primary;
  }, [tone]);

  const normalizeSize = (s) => {
    if (!s) return "medium";
    if (s === "sm") return "small";
    if (s === "lg") return "medium";
    if (s === "md") return "medium";
    return s;
  };

  const Spinner = (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: 4,
        marginRight: 0,
        color: muiVariant === "filled" ? textColor || toneMap.fg : toneMap.text,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        opacity="0.85"
      />
    </svg>
  );

  const mergeSx = (base) => (userSx ? [base, userSx] : base);

  const baseTextColor =
    muiVariant === "filled" ? textColor || toneMap.fg : toneMap.text;
  const chipSx = mergeSx({
    "&&": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "auto",
      flexShrink: 0,
      flexGrow: 0,
      borderRadius,
      fontWeight: 600,
      letterSpacing: 0.2,
      paddingInline: 1,
      color: baseTextColor,
      backgroundColor: muiVariant === "filled" ? toneMap.bg : "transparent",
      border:
        muiVariant === "outlined" ? `1px solid ${toneMap.border}` : "none",
      transition: "all 0.25s ease",
      opacity: isDisabled ? 0.6 : 1,
      pointerEvents: isDisabled ? "none" : "auto",
    },

    "&&:hover": {
      backgroundColor:
        muiVariant === "filled" ? toneMap.hoverBg : "transparent",
      borderColor: muiVariant === "outlined" ? toneMap.border : undefined,
      transform: isDisabled ? "none" : "translateY(-0.5px)",
      boxShadow: isDisabled ? "none" : `0 6px 14px ${toneMap.ring}`,
    },
    "&&.Mui-focusVisible": {
      outline: "none",
      boxShadow: `0 0 0 4px ${toneMap.ring}`,
    },

    "& .MuiChip-icon, & .MuiChip-deleteIcon": {
      color: baseTextColor,
      opacity: 0.9,
    },

    ...(normalizeSize(size) === "small"
      ? { fontSize: 12, height: 26 }
      : { fontSize: 13.5, height: 32 }),
  });

  const renderedLabel = (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {startIcon ? (
        <span style={{ display: "inline-flex", marginRight: 6 }}>
          {startIcon}
        </span>
      ) : null}
      <span>{label}</span>
      {loading ? <span style={{ marginLeft: 6 }}>{Spinner}</span> : null}
      {endIcon ? (
        <span style={{ display: "inline-flex", marginLeft: 6 }}>{endIcon}</span>
      ) : null}
    </span>
  );

  return (
    <Chip
      ref={ref}
      className={className}
      sx={chipSx}
      label={renderedLabel}
      clickable={clickable}
      onClick={!isDisabled ? onClick : undefined}
      onDelete={!isDisabled ? onDelete : undefined}
      disabled={isDisabled}
      variant={muiVariant}
      size={normalizeSize(size)}
      color="default"
      aria-busy={loading || undefined}
      {...restMuiProps}
    />
  );
});

export default ThemeChip;
