import { CalendarHeart } from "lucide-react";
import styles from "./today.module.css";

export default function TodayPage() {
  const date = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
  return (
    <main className={styles.page}>
      <header><span>{date}</span><h1>今天吃什么？</h1><p>把今天想吃的菜放在这里。</p></header>
      <section className={styles.card}>
        <div className={styles.icon}><CalendarHeart aria-hidden="true" /></div>
        <h2>今日菜单还空着</h2>
        <p>下一阶段接入菜单同步后，就能和家人一起选菜啦。</p>
      </section>
    </main>
  );
}
