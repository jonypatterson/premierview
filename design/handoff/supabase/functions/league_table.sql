-- league_table() — applied to Supabase project bgijzlomphztrxobsgiq as the
-- migration "league_table_rpc_v2". Reference copy; already live.
--
-- Standings for the current season's latest matchweek, plus each club's final
-- position last season so the UI can show movement between the two.
--
-- Two notes on the data it works around:
--   * match_team_stats is empty, so last-5 form is derived from matches.
--   * clubs.primary_colour_hex is stored without a leading '#'.

create or replace function public.league_table()
returns jsonb
language sql stable security definer set search_path = public as $$
with cur as (
  select id, label, year_start from seasons where is_current order by year_start desc limit 1
), prev as (
  select id, label from seasons
  where year_start = (select year_start from cur) - 1 limit 1
), mw as (
  select max(gameweek_number) n from team_gameweek_stats where season_id = (select id from cur)
), prev_final as (
  select t.club_id, t.league_position pos
  from team_gameweek_stats t
  where t.season_id = (select id from prev)
    and t.gameweek_number = (
      select max(gameweek_number) from team_gameweek_stats where season_id = (select id from prev))
), results as (
  select m.home_club_id club_id, m.kickoff_time,
         case when m.home_score > m.away_score then 'W'
              when m.home_score = m.away_score then 'D' else 'L' end res
  from matches m
  where m.season_id = (select id from cur) and m.status = 'completed'
    and m.home_score is not null
  union all
  select m.away_club_id, m.kickoff_time,
         case when m.away_score > m.home_score then 'W'
              when m.away_score = m.home_score then 'D' else 'L' end
  from matches m
  where m.season_id = (select id from cur) and m.status = 'completed'
    and m.home_score is not null
), form5 as (
  select club_id, array_agg(res order by kickoff_time) f
  from (select *, row_number() over (partition by club_id order by kickoff_time desc) rn
        from results) x
  where rn <= 5 group by club_id
)
select jsonb_build_object(
  'season', (select label from cur),
  'prevSeason', (select label from prev),
  'matchweek', (select n from mw),
  'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.pos), '[]'::jsonb)
)
from (
  select t.league_position pos, c.code, c.name, c.short_name,
         case when c.primary_colour_hex is null then '#191613'
              when left(c.primary_colour_hex, 1) = '#' then c.primary_colour_hex
              else '#' || c.primary_colour_hex end colour,
         t.played, t.wins, t.draws, t.losses,
         t.goals_scored gf, t.goals_conceded ga, t.goal_difference gd, t.points,
         pf.pos prev_pos,
         case when pf.pos is null then null else pf.pos - t.league_position end delta,
         coalesce(f.f, '{}') last5
  from team_gameweek_stats t
  join clubs c on c.id = t.club_id
  left join prev_final pf on pf.club_id = t.club_id
  left join form5 f on f.club_id = t.club_id
  where t.season_id = (select id from cur) and t.gameweek_number = (select n from mw)
) r;
$$;

grant execute on function public.league_table() to anon, authenticated;
