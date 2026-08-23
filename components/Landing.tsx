"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubPicker from "./ClubPicker";
import Skeleton from "./Skeleton";
import { STORAGE_KEY } from "@/lib/format";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import type { Club } from "@/lib/types";

/**
 * No saved club → picker. Saved → straight to their season page, with the
 * skeleton covering the hop so the picker never flashes.
 */
export default function Landing({ clubs, seasonLabel }: { clubs: Club[]; seasonLabel: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const list = clubs.length ? clubs : FALLBACK_CLUBS;

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode — fall through to the picker */
    }
    if (saved && list.some((c) => c.code === saved)) router.replace(`/${saved}`);
    else setChecked(true);
  }, [list, router]);

  if (!checked) return <Skeleton />;
  return <ClubPicker clubs={list} seasonLabel={seasonLabel} />;
}
