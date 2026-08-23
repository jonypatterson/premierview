-- Confirms whether last season's player figures are truncated to the league's
-- top scorers. Paste into the Supabase SQL editor.
--
-- The tell: every club has only a handful of rows, and the lowest goal count
-- across the whole league is well above 1. A real season has ~300 scorers,
-- many of them on one or two goals.

-- 1. How many players does each club have, and what's the lowest tally?
select
  c.code,
  count(*)                      as player_rows,
  count(*) filter (where p.goals > 0) as scored,
  min(p.goals) filter (where p.goals > 0) as fewest_goals,
  max(p.goals)                  as most_goals
from player_season_stats p
join players pl on pl.id = p.player_id
join clubs c    on c.id = pl.club_id
join seasons s  on s.id = p.season_id
where s.label = '2025/26'          -- adjust if the column is named differently
group by c.code
order by player_rows;

-- 2. League-wide floor. If this is 3 or 4 rather than 1, the feed was cut off.
select
  count(*)        as scorer_rows,
  min(goals)      as fewest_goals,
  count(distinct player_id) as distinct_players
from player_season_stats p
join seasons s on s.id = p.season_id
where s.label = '2025/26' and p.goals > 0;

-- 3. The specific case: a player known to have scored twice.
select pl.name, p.goals, p.assists
from player_season_stats p
join players pl on pl.id = p.player_id
join seasons s  on s.id = p.season_id
where s.label = '2025/26' and pl.name ilike '%havertz%';
