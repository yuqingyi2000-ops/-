import { DEFAULT_PAGE_TITLE, DEFAULT_PAGE_SUBTITLE } from "@/lib/constants";
import styles from "./hero.module.css";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export function HeroSection({
  title = DEFAULT_PAGE_TITLE,
  subtitle = DEFAULT_PAGE_SUBTITLE,
}: HeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.titleSection}>
        <h1 className={`${styles.mainTitle} page-header`}>{title}</h1>
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
