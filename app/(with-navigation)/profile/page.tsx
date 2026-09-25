"use client";

import Link from "next/link";
import { LogOut, UserRound, UsersRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  if (loading) return <main className={styles.simplePage}>正在准备你的饭饭簿…</main>;

  return (
    <main className={styles.simplePage}>
      <header><span>MY LITTLE SPACE</span><h1>我的</h1></header>
      <section className={styles.simpleCard}>
        <div className={styles.simpleAvatar}><UserRound /></div>
        {user ? (
          <><h2>{user.user_metadata?.full_name || "饭饭簿成员"}</h2><p>{user.email}</p></>
        ) : (
          <><h2>欢迎来到饭饭簿</h2><p>登录后就能保存和管理自己的菜谱。</p></>
        )}
      </section>
      <section className={styles.spaceCard}>
        <UsersRound />
        <div><span>当前共享空间</span><strong>我们的饭饭簿</strong><small>多人共享将在下一阶段开放</small></div>
      </section>
      {user ? (
        <button className={styles.simpleButton} onClick={() => void signOut()}><LogOut />退出登录</button>
      ) : (
        <Link className={styles.simpleButton} href="/auth/signin">登录 / 注册</Link>
      )}
    </main>
  );
}
