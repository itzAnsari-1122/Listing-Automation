import React from "react";
import { RiRocketFill } from "react-icons/ri";
import ThemeButton from "../../components/ui/ThemeButton";

const ComingSoon = () => {
  return (
    <div className="mx-auto mt-20 flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex items-center gap-3">
        <h1
          className="text-4xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Coming Soon 🚀
        </h1>
      </div>
      <p
        className="mb-10 max-w-xl text-lg text-gray-400"
        style={{ color: "var(--color-text-secondary)" }}
      >
        We’re working hard to bring you something amazing. This feature isn’t
        ready yet, but it’s on the way!
      </p>
      <ThemeButton
        size="md"
        tone="primary"
        variant="contained"
        onClick={() => window.history.back()}
      >
        Go Back
      </ThemeButton>
    </div>
  );
};

export default ComingSoon;
