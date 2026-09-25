"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@khamudom/lumen-ui-react";
import styles from "./search-controls.module.css";
import { useCallback, useEffect, useState } from "react";

interface SearchControlsProps {
  initialQuery?: string;
}

export function SearchControls({ initialQuery = "" }: SearchControlsProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch) {
        router.push(`/search?q=${encodeURIComponent(trimmedSearch)}`);
      }
    },
    [router, searchTerm]
  );

  return (
    <div className={styles.controls}>
      <form onSubmit={handleSearchSubmit} className={styles.searchContainer}>
        <div className={styles.inputWrapper}>
          <Input
            placeholder="搜搜今天想吃什么"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            type="search"
            aria-label="搜索菜谱"
          />
          <Button
            type="submit"
            className={styles.searchButton}
            aria-label="搜索菜谱"
            icon={<Search className={styles.buttonIcon} aria-hidden="true" />}
          />
        </div>
      </form>
    </div>
  );
}
