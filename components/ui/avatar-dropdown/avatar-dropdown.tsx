"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  Dialog,
  Dropdown,
  DropdownItem,
  Separator,
} from "@khamudom/lumen-ui-react";
import { User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "../../../lib/auth-context";
import styles from "./avatar-dropdown.module.css";

const About = dynamic(() => import("../about/about").then((mod) => mod.About));

function firstLetter(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : null;
}

function getUserInitials(user: User): string {
  return (
    firstLetter(user.email) ??
    firstLetter(user.user_metadata?.email) ??
    firstLetter(user.user_metadata?.full_name) ??
    firstLetter(user.user_metadata?.name) ??
    "U"
  );
}

export function AvatarDropdown() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className={styles.dropdownContainer}>
      <Dropdown
        align="end"
        className={styles.lumenDropdown}
        triggerShape="circle"
        trigger={
          <Avatar size="md" className={styles.avatar} aria-label="User menu">
            <AvatarFallback className={styles.initials}>
              {user ? getUserInitials(user) : <UserIcon size={20} aria-hidden="true" />}
            </AvatarFallback>
          </Avatar>
        }
      >
        {user && (
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
        )}
        <DropdownItem onClick={() => router.push("/")}>Recipes</DropdownItem>
        {user && (
          <DropdownItem onClick={() => router.push("/add")}>
            Add Recipe
          </DropdownItem>
        )}
        <DropdownItem onClick={() => setIsAboutModalOpen(true)}>
          About
        </DropdownItem>
        {user && (
          <DropdownItem onClick={() => router.push("/profile")}>
            Profile
          </DropdownItem>
        )}
        <Separator />
        {user ? (
          <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
        ) : (
          <>
            <DropdownItem onClick={() => router.push("/auth/signin")}>
              Sign In
            </DropdownItem>
            <DropdownItem onClick={() => router.push("/auth/signup")}>
              Sign Up
            </DropdownItem>
          </>
        )}
      </Dropdown>

      <Dialog
        open={isAboutModalOpen}
        onOpenChange={setIsAboutModalOpen}
        heading="About The Recipe Room"
        className={styles.aboutDialog}
      >
        <About />
      </Dialog>
    </div>
  );
}
