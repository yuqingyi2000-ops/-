"use client";

import Link from "next/link";
import styles from "./navigation.module.css";
import Image from "next/image";
import { AvatarDropdown } from "../../ui/avatar-dropdown/avatar-dropdown";
import { Button } from "@khamudom/lumen-ui-react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export function Navigation() {
  const { user } = useAuth();
  const router = useRouter();

  const handleAddRecipe = () => {
    if (user) {
      router.push("/add");
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/logo-trr.webp"
            alt="Recipe Room Logo"
            width={40}
            height={40}
            priority
            sizes="50px"
            quality={90}
          />
          <div className={styles.logoText}>
            <span>The</span>Recipe Room
          </div>
        </Link>
        <div className={styles.menu}>
          <Button
            onClick={handleAddRecipe}
            variant="secondary"
            icon={<Plus className={styles.buttonIcon} aria-hidden="true" />}
            className={styles.addButton}
            aria-label={user ? "Add new recipe" : "Sign in to add recipe"}
          >
            Add Recipe
          </Button>
          <AvatarDropdown />
        </div>
      </div>
    </nav>
  );
}
