import React from "react";
import "../../index.css";

const ThemeLoader = ({
  type = "fullpage",
  message = "Loading...",
  size = 80,
}) => {
  const styles = {
    circle: {
      width: size,
      height: size,
      border: "6px solid var(--color-surface)",
      borderTop: "6px solid var(--color-primary)",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      boxShadow: "0 6px 16px var(--color-shadow-light)",
    },
  };

  return (
    <>
      {type === "fullpage" && (
        <div
          className="flex h-screen w-screen flex-col items-center justify-center transition-all duration-500"
          style={{
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
          }}
        >
          <div style={styles.circle}></div>
          <p
            className="mt-6 text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {message}
          </p>
        </div>
      )}

      {type === "overlay" && (
        <div
          className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))",
          }}
        >
          <div className="bg-[color:var(--color-surface)]/90 pointer-events-auto rounded-2xl px-6 py-6 shadow-lg backdrop-blur">
            <div className="flex flex-col items-center">
              <div style={styles.circle}></div>
              <p
                className="mt-4 text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {type === "circle" && (
        <div className="flex items-center justify-center">
          <div style={styles.circle}></div>
        </div>
      )}

      {type === "bar" && (
        <div
          className="fixed left-0 top-0 z-[9999] h-1 w-full overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="animate-slide h-full"
            style={{ backgroundColor: "var(--color-primary)", width: "30%" }}
          />
          <style>
            {`
              @keyframes slide {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
                100% { transform: translateX(300%); }
              }
              .animate-slide {
                animation: slide 1.2s ease-in-out infinite;
              }
            `}
          </style>
        </div>
      )}

      {type === "dots" && (
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: "var(--color-primary)",
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <style>
            {`
              @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
                40% { transform: scale(1); opacity: 1; }
              }
            `}
          </style>
        </div>
      )}

      {type === "minimal" && (
        <p
          className="text-center text-sm tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          {message}
        </p>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default ThemeLoader;
