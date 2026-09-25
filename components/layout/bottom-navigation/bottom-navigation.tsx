"use client";

import Link from "next/link";
import { BookOpen, CalendarHeart, CirclePlus, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./bottom-navigation.module.css";

const items = [
  { href: "/", label: "菜谱", icon: BookOpen },
  { href: "/today", label: "今日菜单", icon: CalendarHeart },
  { href: "/add", label: "添加", icon: CirclePlus },
  { href: "/profile", label: "我的", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="主要导航">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ""}`}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
