"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubPicker from "./ClubPicker";
import PlayersView from "./PlayersView";
import ProblemState from "./ProblemState";
import SeasonView from "./SeasonView";
import TabBar from "./TabBar";
import { COMPARE_MODE } from "@/lib/config";
import { DEFAULT_ACCENT, STORAGE_KEY, short } from "@/lib/format";
import type { Club, TeamPage } from "@/lib/types";

type Props = {
  tla: string;
  data: TeamPage | null;
  error?: string | null;
  clubs: Club[];
};

export default function TeamApp({ tla, data, error, clubs }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"season" | "players">("season");
  const [picker, setPicker] = useState(false);

  // Visiting /MUN directly is also a choice — remember it, so / lands here next.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, tla);
    } catch {
      /* private mode */
    }
  }, [tla]);

  const accent = data?.team.colour || clubs.find((c) => c.code === tla)?.colour || DEFAULT_ACCENT;
  const teamName =
    data?.team.short_name ||
    data?.team.name ||
    clubs.find((c) => c.code === tla)?.short_name ||
    tla;

  if (picker) {
    return (
      <ClubPicker
        clubs={clubs}
        seasonLabel={
          data ? `${short(data.seasons.current)} vs ${short(data.seasons.previous)}` : ""
        }
        current={{ tla, name: teamName }}
        onKeep={() => setPicker(false)}
      />
    );
  }

  if (!data) {
    return (
      <ProblemState
        kind={error ? "error" : "empty"}
        message={error}
        lastSync="unknown"
        onRetry={() => router.refresh()}
      />
    );
  }

  return (
    <>
      {/* Keyed so the staggered entrance replays on every tab switch. */}
      {tab === "season" ? (
        <SeasonView
          key="season"
          data={data}
          accent={accent}
          mode={COMPARE_MODE}
          onOpenPicker={() => setPicker(true)}
        />
      ) : (
        <PlayersView
          key="players"
          data={data}
          accent={accent}
          onOpenPicker={() => setPicker(true)}
        />
      )}
      <TabBar
        tab={tab}
        accent={accent}
        onSeason={() => setTab("season")}
        onPlayers={() => setTab("players")}
        onPicker={() => setPicker(true)}
      />
    </>
  );
}
