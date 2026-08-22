import { DEFAULT_FOOTER_QUOTE } from "@/lib/constants";
import styles from "./footer.module.css";

interface FooterProps {
  quote?: string;
}

export function Footer({ quote = DEFAULT_FOOTER_QUOTE }: FooterProps) {
  return (
    <div className={styles.footer}>
      <div className={styles.footerLine}></div>
      <p className={styles.footerText}>{quote}</p>
    </div>
  );
}
