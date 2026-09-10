"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubPicker from "./ClubPicker";
import PlayersView from "./PlayersView";
import ProblemState from "./ProblemState";
import SeasonView from "./SeasonView";
import TabBar, { type Tab } from "./TabBar";
import TableView from "./TableView";
import { rememberClub } from "@/lib/club-memory";
import { COMPARE_MODE } from "@/lib/config";
import { cardChalk, MARK_INK, snap } from "@/lib/palette";
import { playersView, seasonView } from "@/lib/view";
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
  const [tab, setTab] = useState<Tab>("season");
  const [picker, setPicker] = useState(false);

  // Visiting /MUN directly is also a choice — remember it, so / lands here next.
  // This is also what backfills the cookie for visitors who only have the
  // older localStorage entry.
  useEffect(() => {
    rememberClub(tla);
  }, [tla]);

  const club = clubs.find((c) => c.code === tla);
  // The mark takes the nearest chalk, never the club's own hex.
  const markColour = snap(data?.team.colour || club?.colour);
  // The same chalk, safe to fill a card or paint a glyph with — a club that
  // snaps to cream would otherwise be an invisible card on a cream app.
  const clubChalk = cardChalk(markColour);
  const teamName =
    data?.team.short_name || data?.team.name || club?.short_name || club?.name || tla;

  if (picker) {
    return <ClubPicker clubs={clubs} currentTla={tla} onClose={() => setPicker(false)} />;
  }

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
  const identity = { tla, teamName, markColour, markInk: MARK_INK };

  return (
    <>
      {/* Keyed so the entrance replays on every tab switch. */}
      {tab === "table" ? (
        table ? (
          <TableView
            key="table"
            table={table}
            myTla={tla}
            accent={clubChalk}
            onOpenPicker={() => setPicker(true)}
          />
        ) : (
          <ProblemState
            kind="empty"
            message="The league table didn't load."
            lastSync={data.lastSync ?? "unknown"}
            onRetry={() => router.refresh()}
            onChooseClub={() => setPicker(true)}
          />
        )
      ) : tab === "season" ? (
        <SeasonView
          key="season"
          vm={seasonView(played, COMPARE_MODE)}
          {...identity}
          onOpenPicker={() => setPicker(true)}
        />
      ) : (
        <PlayersView
          key="players"
          vm={playersView(played, clubChalk)}
          {...identity}
          onOpenPicker={() => setPicker(true)}
        />
      )}
      <TabBar
        tab={tab}
        accent={clubChalk}
        onSeason={() => setTab("season")}
        onPlayers={() => setTab("players")}
        onTable={() => setTab("table")}
        onPicker={() => setPicker(true)}
      />
    </>
  );
}
