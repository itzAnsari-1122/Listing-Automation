import React from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import MainCard from "../../components/ui/MainCard";
import ThemeTextField from "../../components/ui/ThemeTextField";
import ThemeButton from "../../components/ui/ThemeButton";

export default function Login() {
  const { loginService } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    const payload = { email: data.email, password: data.password };
    loginService(payload);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <MainCard
        className="w-full max-w-md p-8 shadow-[0_12px_30px_var(--color-shadow-heavy)]"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <h1
          className="mb-6 text-center text-3xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <ThemeTextField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            isController
            control={control}
            rules={{
              required: "Email is required",
            }}
            error={errors.email?.message}
          />

          <ThemeTextField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            isController
            control={control}
            rules={{
              required: "Password is required",
            }}
            error={errors.password?.message}
          />

          <ThemeButton
            type="submit"
            loading={isSubmitting}
            className="mt-6 w-full"
          >
            Login
          </ThemeButton>
        </form>
      </MainCard>
    </div>
  );
}
