// ThemeToaster.jsx
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";

/* -------------------------
   Simple pub/sub + id gen
   ------------------------- */
let idCounter = 0;
const nextId = () => ++idCounter;
const listeners = new Set();
const emit = (fn, payload) =>
  listeners.forEach((cb) => {
    try {
      cb(fn, payload);
    } catch (e) {
      console.error("ThemeToaster listener error:", e);
    }
  });

/* queue for pushes that happen before toaster mounts */
const _pendingPushes = [];

/* -------------------------
   Default config
   ------------------------- */
const defaultConfig = {
  position: "top-right",
  duration: 4500,
  maxToasts: 5,
  pauseOnHover: true,
  draggable: true,
  closeOnClick: true,
  showProgress: true,
  fixedWidth: 360,
};

/* -------------------------
   Public API
   ------------------------- */
export const themeToast = {
  _config: { ...defaultConfig },

  configure(opts = {}) {
    this._config = { ...this._config, ...opts };
    emit("config", this._config);
  },

  _push(type, message, opts = {}) {
    const toast = {
      id: nextId(),
      type: type || "info",
      message,
      createdAt: Date.now(),
      duration:
        typeof opts.duration === "number"
          ? opts.duration
          : this._config.duration,
      pauseOnHover: opts.pauseOnHover ?? this._config.pauseOnHover,
      showProgress: opts.showProgress ?? this._config.showProgress,
      draggable: opts.draggable ?? this._config.draggable,
      closeOnClick: opts.closeOnClick ?? this._config.closeOnClick,
      raw: opts,
    };

    // Keep a pending copy so pushes before mount can be flushed.
    _pendingPushes.push(toast);

    emit("push", toast);
    return toast.id;
  },

  success(msg, opts) {
    return this._push("success", msg, opts);
  },
  error(msg, opts) {
    return this._push("error", msg, opts);
  },
  info(msg, opts) {
    return this._push("info", msg, opts);
  },
  warn(msg, opts) {
    return this._push("warn", msg, opts);
  },
  show(msg, opts = {}) {
    return this._push(opts.type || "info", msg, opts);
  },

  dismiss(id) {
    emit("dismiss", { id });
  },
  clear() {
    emit("clear");
  },

  /* helper to let ThemeToaster know pending pushes were consumed */
  _consumePending() {
    const list = _pendingPushes.splice(0, _pendingPushes.length);
    return list;
  },
};

/* -------------------------
   Circle Icon with react-icons
   ------------------------- */
const IconCircle = ({ type }) => {
  const colorMap = {
    success: "var(--color-success, #16a34a)",
    error: "var(--color-danger, #ef4444)",
    warn: "var(--color-warn, #f59e0b)",
    info: "var(--color-primary, #3b82f6)",
  };

  const iconMap = {
    success: <FiCheckCircle size={22} />,
    error: <FiXCircle size={22} />,
    warn: <FiAlertTriangle size={22} />,
    info: <FiInfo size={22} />,
  };

  const color = colorMap[type] || colorMap.info;
  const icon = iconMap[type] || iconMap.info;

  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.05)",
        color,
        flexShrink: 0,
        boxShadow: `0 0 10px ${color}33`,
        border: `2px solid ${color}33`,
        transition: "transform 0.25s ease",
      }}
      className="toast-icon-circle"
    >
      {icon}
    </div>
  );
};

/* -------------------------
   Toast Item
   ------------------------- */
function ToastItem({ toast, onRemove, fixedWidth }) {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removed, setRemoved] = useState(false);

  const progressRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const pauseStartRef = useRef(null);
  const accPausedRef = useRef(0);

  useEffect(() => {
    if (!toast.showProgress) return;
    const tick = () => {
      if (paused || removed) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - toast.createdAt + accPausedRef.current;
      const pct = Math.min(100, (elapsed / toast.duration) * 100);
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;
      if (pct >= 100) {
        close();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, toast.duration, toast.showProgress, removed]);

  useEffect(() => {
    if (toast.showProgress) return;
    const t = setTimeout(() => close(), toast.duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (removed) return;
    setRemoved(true);
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 260);
  };

  useEffect(() => {
    if (!toast.draggable) return;
    const node = document.getElementById(`toast-${toast.id}`);
    if (!node) return;

    const onPointerDown = (e) => {
      setDragging(true);
      startRef.current = e.clientX ?? (e.touches && e.touches[0].clientX);
      node.setPointerCapture && node.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? (e.touches && e.touches[0].clientX);
      const delta = x - startRef.current;
      setDragX(delta);
    };
    const onPointerUp = (e) => {
      if (!dragging) return;
      setDragging(false);
      if (Math.abs(dragX) > 120) {
        close();
      } else {
        setDragX(0);
      }
      node.releasePointerCapture && node.releasePointerCapture(e.pointerId);
    };

    node.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragging, dragX, toast.draggable]);

  const onEnter = () => {
    if (!toast.pauseOnHover) return;
    pauseStartRef.current = Date.now();
    setPaused(true);
  };
  const onLeave = () => {
    if (!toast.pauseOnHover) return;
    setPaused(false);
    accPausedRef.current += Date.now() - (pauseStartRef.current || Date.now());
  };

  const typeColor =
    {
      success: "var(--color-success, #16a34a)",
      error: "var(--color-danger, #ef4444)",
      warn: "var(--color-warn, #f59e0b)",
      info: "var(--color-primary, #3b82f6)",
    }[toast.type] || "var(--color-primary, #3b82f6)";

  const transformStyle = dragX
    ? { transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)` }
    : undefined;
  const opacity = leaving ? 0 : 1;

  return (
    <div
      id={`toast-${toast.id}`}
      role="status"
      aria-live="polite"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className={`theme-toast ${leaving ? "toast-leave" : "toast-enter"}`}
      style={{
        pointerEvents: "auto",
        width: fixedWidth,
        background:
          "linear-gradient(180deg, var(--color-surface, #1e293b), rgba(255,255,255,0.02))",
        color: "var(--color-text, #f8fafc)",
        borderRadius: 14,
        boxShadow: "0 18px 40px rgba(2,6,23,0.28)",
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        opacity,
        transition:
          "transform 220ms cubic-bezier(.2,.9,.25,1), opacity 220ms linear",
        ...transformStyle,
      }}
    >
      <IconCircle type={toast.type} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--color-text, #fff)",
            }}
          >
            {toast.message}
          </div>

          <button
            aria-label="close"
            onClick={close}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 15,
              cursor: "pointer",
              color: "var(--color-text, #fff)",
              opacity: 0.85,
            }}
          >
            ✕
          </button>
        </div>

        {toast.raw?.sub && (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "var(--color-text, #f1f5f9)",
              opacity: 0.75,
            }}
          >
            {toast.raw.sub}
          </div>
        )}

        {toast.showProgress && (
          <div
            style={{
              height: 6,
              marginTop: 12,
              borderRadius: 8,
              overflow: "hidden",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              ref={progressRef}
              style={{
                width: "0%",
                height: "100%",
                background: typeColor,
                transition: "width 100ms linear",
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        .theme-toast.toast-enter { transform: translateY(-6px) scale(0.997); }
        .theme-toast.toast-leave { transform: translateY(-6px) scale(0.995); opacity: 0; }
        .toast-icon-circle:hover { transform: scale(1.08); }
        @media (max-width: 420px) {
          .theme-toast { width: calc(100vw - 32px) !important; }
        }
      `}</style>
    </div>
  );
}

/* -------------------------
   Position Helper
   ------------------------- */
const posMap = {
  "top-right": "top:16px; right:16px; align-items:flex-end;",
  "top-left": "top:16px; left:16px; align-items:flex-start;",
  "bottom-right": "bottom:16px; right:16px; align-items:flex-end;",
  "bottom-left": "bottom:16px; left:16px; align-items:flex-start;",
  "top-center":
    "top:16px; left:50%; transform:translateX(-50%); align-items:center;",
  "bottom-center":
    "bottom:16px; left:50%; transform:translateX(-50%); align-items:center;",
};

function parseInlineStyle(inline) {
  return inline.split(";").reduce((acc, pair) => {
    const [k, v] = pair.split(":").map((s) => s && s.trim());
    if (!k || !v) return acc;
    const prop = k.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    acc[prop] = v;
    return acc;
  }, {});
}

export function ThemeToaster() {
  const [toasts, setToasts] = useState([]);
  const [config, setConfig] = useState({ ...defaultConfig });
  const mountedRef = useRef(false);

  useEffect(() => {
    const handler = (fnName, payload) => {
      if (fnName === "push") {
        setToasts((prev) => {
          const next = [payload, ...prev].slice(0, config.maxToasts);
          return next;
        });
      } else if (fnName === "dismiss") {
        setToasts((prev) => prev.filter((t) => t.id !== payload.id));
      } else if (fnName === "clear") {
        setToasts([]);
      } else if (fnName === "config") {
        setConfig({ ...themeToast._config });
      }
    };

    listeners.add(handler);
    setConfig({ ...themeToast._config });

    const pending = themeToast._consumePending();
    if (pending && pending.length) {
      setToasts((prev) => {
        const next = [...pending.reverse(), ...prev].slice(
          0,
          themeToast._config.maxToasts
        );
        return next;
      });
    }

    mountedRef.current = true;
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const inline = posMap[config.position] || posMap["top-right"];
  const containerStyle = {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 8,
    pointerEvents: "none",
    ...parseInlineStyle(inline),
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="theme-toaster-root"
      style={containerStyle}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "auto",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ToastItem
            toast={t}
            onRemove={remove}
            fixedWidth={`${config.fixedWidth}px`}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}
