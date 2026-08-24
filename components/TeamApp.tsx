"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubPicker from "./ClubPicker";
import PlayersView from "./PlayersView";
import ProblemState from "./ProblemState";
import SeasonView from "./SeasonView";
import TabBar from "./TabBar";
import TableView from "./TableView";
import { COMPARE_MODE } from "@/lib/config";
import { DEFAULT_ACCENT, STORAGE_KEY, short, textOn } from "@/lib/format";
import type { Club, LeagueTable, PlayedTeamPage, TeamPage } from "@/lib/types";

type Props = {
  tla: string;
  data: TeamPage | null;
  error?: string | null;
  clubs: Club[];
  /** Standings, fetched alongside the club page; null if the RPC failed. */
  table?: LeagueTable | null;
};

export default function TeamApp({ tla, data, error, clubs, table }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"season" | "players" | "table">("season");
  const [picker, setPicker] = useState(false);

  // Visiting /MUN directly is also a choice — remember it, so / lands here next.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, tla);
    } catch {
      /* private mode */
    }
  }, [tla]);

  const club = clubs.find((c) => c.code === tla);
  const accent = data?.team.colour || club?.colour || DEFAULT_ACCENT;
  const teamName =
    data?.team.short_name || data?.team.name || club?.short_name || club?.name || tla;

  const seasonLabel = data
    ? `${short(data.seasons.current)} vs ${short(data.seasons.previous)}`
    : "";

  if (picker) {
    return (
      <ClubPicker
        clubs={clubs}
        seasonLabel={seasonLabel}
        current={{ tla, name: teamName }}
        onKeep={() => setPicker(false)}
      />
    );
  }

  // A club we know about that simply hasn't played yet reads differently from
  // a code we can't place at all.
  if (!data || !data.summary) {
    const kind = error ? "error" : data ? "no-matches" : "empty";
    return (
      <ProblemState
        kind={kind}
        clubName={teamName}
        message={error}
        lastSync={data?.lastSync ?? "unknown"}
        onRetry={() => router.refresh()}
        onChooseClub={() => setPicker(true)}
      />
    );
  }

  const played = data as PlayedTeamPage;

  return (
    <>
      {/* Keyed so the staggered entrance replays on every tab switch. */}
      {tab === "table" ? (
        table ? (
          <TableView
            key="table"
            table={table}
            accent={accent}
            accentFg={textOn(accent)}
            tla={tla}
            myTla={tla}
            onOpenPicker={() => setPicker(true)}
          />
        ) : (
          <ProblemState
            kind="empty"
            message="The league table didn't load."
            lastSync={data.lastSync}
            onRetry={() => router.refresh()}
            onChooseClub={() => setPicker(true)}
          />
        )
      ) : tab === "season" ? (
        <SeasonView
          key="season"
          data={played}
          accent={accent}
          mode={COMPARE_MODE}
          onOpenPicker={() => setPicker(true)}
        />
      ) : (
        <PlayersView
          key="players"
          data={played}
          accent={accent}
          onOpenPicker={() => setPicker(true)}
        />
      )}
      <TabBar
        tab={tab}
        accent={accent}
        onSeason={() => setTab("season")}
        onPlayers={() => setTab("players")}
        onTable={() => setTab("table")}
        onPicker={() => setPicker(true)}
      />
    </>
  );
}
