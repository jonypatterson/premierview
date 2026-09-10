import type { CSSProperties } from "react";
import { AppHeader, Button, Eyebrow, HeroStat, PlayerRow, StatTile } from "./ds";
import SiteFooter from "./SiteFooter";
import type { PlayersVM } from "@/lib/view";

/**
 * How many rows the two columns split into above 1180px. Half the list, so the
 * names fill the left column top to bottom and continue down the right —
 * `repeat(0, …)` is invalid, hence the floor of one.
 */
const cols = (n: number) => ({ "--rows": Math.max(1, Math.ceil(n / 2)) }) as CSSProperties;

type Props = {
  vm: PlayersVM;
  tla: string;
  teamName: string;
  markColour: string;
  markInk: string;
  onOpenPicker: () => void;
};

/** Who is scoring them, and who is setting them up. */
export default function PlayersView({
  vm,
  tla,
  teamName,
  markColour,
  markInk,
  onOpenPicker,
}: Props) {
  return (
    <div className="mw-pad mw-screen">
      <div style={{ animation: "rise .34s ease both", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AppHeader
              initials={tla}
              title={teamName}
              meta={vm.headerMeta}
              markBackground={markColour}
              markColor={markInk}
            />
          </div>
          <Button size="sm" onClick={onOpenPicker}>
            Change club
          </Button>
        </div>
      </div>

      <div className="mw-grid mw-players">
        <div className="a-hero" style={{ animation: "rise .34s ease .04s both" }}>
          <HeroStat
            eyebrow={vm.topScorerLabel}
            value={vm.topScorerName}
            label={vm.topScorerGoals}
            delta={vm.topScorerDelta}
            deltaCaption={vm.topScorerNote}
            background="var(--accent-2)"
          />
        </div>

        <div
          className="a-tiles"
          style={{ display: "flex", gap: 10, height: "100%", animation: "rise .34s ease .08s both" }}
        >
          {vm.playerSummary.map((c) => (
            <StatTile key={c.code} eyebrow={c.code} value={c.value} caption={c.caption} background={c.fill} />
          ))}
        </div>

        <div className="a-scored" style={{ animation: "rise .34s ease .12s both" }}>
          <Eyebrow>Scored</Eyebrow>
          <div style={{ margin: "4px 0 8px" }}>
            <Eyebrow tone="faint">{vm.rowLegend}</Eyebrow>
          </div>
          <div className="player-cols" style={cols(vm.scorers.length)}>
            {vm.scorers.map((p) => (
              <PlayerRow
                key={p.name}
                initials={p.initials}
                name={p.name}
                meta={p.meta}
                value={p.value}
                delta={p.delta}
                deltaColor={p.deltaCol}
                widthNow={p.pct}
                widthPrevious={p.prevPct}
                color={p.bar}
              />
            ))}
          </div>
          {vm.noScorers ? (
            <div
              style={{
                fontSize: "var(--size-body)",
                color: "var(--text-muted)",
                padding: "14px 0",
                borderTop: "1px solid var(--border-hairline)",
                textWrap: "pretty",
              }}
            >
              No goals yet this season. Last season&rsquo;s scorers appear once the first goes in.
            </div>
          ) : null}
        </div>

        <div className="a-assisted" style={{ animation: "rise .34s ease .16s both" }}>
          <Eyebrow>Assisted</Eyebrow>
          <div style={{ margin: "4px 0 8px" }}>
            <Eyebrow tone="faint">{vm.rowLegend}</Eyebrow>
          </div>
          <div className="player-cols" style={cols(vm.assisters.length)}>
            {vm.assisters.map((p) => (
              <PlayerRow
                key={p.name}
                initials={p.initials}
                name={p.name}
                meta={p.meta}
                value={p.value}
                delta={p.delta}
                deltaColor={p.deltaCol}
                widthNow={p.pct}
                widthPrevious={p.prevPct}
                color={p.bar}
              />
            ))}
          </div>
          {vm.noAssisters ? (
            <div
              style={{
                fontSize: "var(--size-body)",
                color: "var(--text-muted)",
                padding: "14px 0",
                borderTop: "1px solid var(--border-hairline)",
              }}
            >
              No assists recorded yet this season.
            </div>
          ) : null}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
