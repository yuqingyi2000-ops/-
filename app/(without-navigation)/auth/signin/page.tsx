"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/features/auth/auth-form/auth-form";
import styles from "./signin.module.css";

type AuthMode = "signin" | "signup" | "forgot-password";

// Constants for better maintainability and performance
const AUTH_CONTENT = {
  signup: {
    title: "加入饭饭簿",
    subtitle: "创建账号，开始收藏喜欢的味道",
  },
  "forgot-password": {
    title: "找回密码",
    subtitle: "输入邮箱，我们会发送密码重置链接",
  },
  signin: {
    title: "欢迎回来",
    subtitle: "登录后继续记录每一顿好好吃饭的日子",
  },
} as const;

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");

  const handleSuccess = () => {
    router.push("/");
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const currentContent = AUTH_CONTENT[mode];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={`${styles.header} auth-header`}>
          {currentContent.title}
        </h1>
        <p className={styles.subtitle}>{currentContent.subtitle}</p>
        <AuthForm
          mode={mode}
          onSuccess={handleSuccess}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
}
