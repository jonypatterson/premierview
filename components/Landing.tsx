"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubPicker from "./ClubPicker";
import Skeleton from "./Skeleton";
import { STORAGE_KEY } from "@/lib/club-memory";
import { FALLBACK_CLUBS } from "@/lib/clubs";
import type { Club } from "@/lib/types";

/**
 * The fallback path only.
 *
 * `/` redirects on the server when the club cookie is present, so a returning
 * visitor never reaches this component. What does reach it is someone who is
 * genuinely new — who gets the picker with no loading screen at all, since
 * there is nothing to check — and someone carrying a localStorage entry from
 * before the cookie existed, who takes this one client-side hop once. Visiting
 * their club writes the cookie, and every visit after that is a server
 * redirect.
 *
 * So the skeleton is only rendered for that one-time migration case. It is
 * deliberately not the initial state: rendering it first would put a loading
 * screen in front of every new visitor to cover a check that, for them,
 * answers "nothing saved" immediately.
 */
export default function Landing({ clubs }: { clubs: Club[] }) {
  const router = useRouter();
  const [migrating, setMigrating] = useState(false);
  const list = clubs.length ? clubs : FALLBACK_CLUBS;

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode — the picker is the right answer */
    }
    if (saved && list.some((c) => c.code === saved)) {
      setMigrating(true);
      router.replace(`/${saved}`);
    }
  }, [list, router]);

  if (migrating) return <Skeleton />;
  return <ClubPicker clubs={list} />;
}
