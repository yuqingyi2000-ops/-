"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, Button, Input } from "@khamudom/lumen-ui-react";
import { supabase } from "../../../../lib/supabase";
import styles from "./auth-form.module.css";

type AuthMode = "signin" | "signup" | "forgot-password";

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthMode) => void;
}

const AUTH_CONTENT = {
  signup: {
    title: "Create Account",
    buttonText: "Create Account",
    loadingText: "Creating account...",
  },
  "forgot-password": {
    title: "Reset Password",
    buttonText: "Send Reset Link",
    loadingText: "Sending reset link...",
  },
  signin: {
    title: "Sign In",
    buttonText: "Sign In",
    loadingText: "Signing in...",
  },
} as const;

const AUTH_MESSAGES = {
  signup: "Check your email for the confirmation link!",
  "forgot-password": "Check your email for the password reset link!",
  signin: "",
} as const;

const AUTH_LINKS = {
  signin: [
    {
      text: "Forgot your password?",
      mode: "forgot-password" as const,
    },
    {
      text: "Don't have an account? Sign up",
      mode: "signup" as const,
    },
  ],
  signup: [
    {
      text: "Already have an account? Sign in",
      mode: "signin" as const,
    },
  ],
  "forgot-password": [
    {
      text: "Back to sign in",
      mode: "signin" as const,
    },
  ],
} as const;

export function AuthForm({ mode, onSuccess, onModeChange }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const currentContent = AUTH_CONTENT[mode];
  const currentLinks = AUTH_LINKS[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage(AUTH_MESSAGES.signup);
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setMessage(AUTH_MESSAGES["forgot-password"]);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess?.();
      }
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
    onModeChange?.(newMode);
  };

  const shouldShowPasswordField = mode !== "forgot-password";

  return (
    <div className={styles.container}>
      <h2 className={`${styles.title} auth-card-title`}>
        {currentContent.title}
      </h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.field}
          placeholder="your@email.com"
        />

        {shouldShowPasswordField && (
          <div className={styles.field}>
            <Input
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.passwordInput}
              placeholder="••••••••"
              minLength={6}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert variant="default">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          loading={loading}
          fullWidth
          className={styles.button}
        >
          {loading ? currentContent.loadingText : currentContent.buttonText}
        </Button>
      </form>
      <div className={styles.links}>
        {currentLinks.map((link, index) => (
          <Button
            key={`${link.mode}-${index}`}
            type="button"
            variant="ghost"
            className={styles.linkButton}
            onClick={() => handleModeChange(link.mode)}
          >
            {link.text}
          </Button>
        ))}
      </div>
      <div className={styles.guestSection}>
        <Button
          type="button"
          variant="ghost"
          className={styles.guestButton}
          onClick={() => router.push("/")}
        >
          Continue as Guest
        </Button>
      </div>
    </div>
  );
}
