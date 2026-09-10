-- Applied to project bgijzlomphztrxobsgiq on 2026-09-10.
--
-- Adds `form_prev` to team_page(): last season's results at the same stage, so
-- the Results block can set this season's form strip against the previous one.
-- Without it the second strip has no data behind it.
--
-- Purely additive. Every existing key keeps its current value and shape, so a
-- deployed client that doesn't know the key is unaffected — which is what made
-- it safe to apply before the app that reads it was released.
--
-- "Same stage" is capped by gameweek number rather than by count: taking the
-- last six of last season outright would compare matchweek 3 against matchweek
-- 38. The join to gameweeks is what makes that cap possible, since `matches`
-- carries only gameweek_id.
--
-- A promoted club has no rows in the previous season and correctly returns [].
-- Verified against ARS, MUN, LEE, SUN and COV: form, summary, players and
-- goals_series were byte-identical before and after; COV returns [].
--
-- Only the block marked below is new; the rest is the function as it stood.

CREATE OR REPLACE FUNCTION public.team_page(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
declare
  v_club        clubs;
  v_cur         seasons;
  v_prev        seasons;
  v_cur_gw      smallint;
  v_summary     jsonb;
  v_series      jsonb;
  v_goals       jsonb;
  v_players     jsonb;
  v_form        jsonb;
  v_form_prev   jsonb;   -- new
  v_last_sync   timestamptz;
begin
  select * into v_club from clubs where upper(code) = upper(p_code);
  if v_club.id is null then
    return null;
  end if;

  select * into v_cur from seasons where is_current limit 1;
  select * into v_prev from seasons
    where id <> v_cur.id and year_start < v_cur.year_start
    order by year_start desc limit 1;

  select max(gameweek_number) into v_cur_gw
  from team_gameweek_stats where season_id = v_cur.id and club_id = v_club.id;

  select jsonb_build_object(
    'matchweek', c.gameweek_number,
    'position', c.league_position,
    'won', c.wins, 'drawn', c.draws, 'lost', c.losses,
    'goals_for', c.goals_scored, 'goals_against', c.goals_conceded,
    'points', c.points,
    'prev_position_same_mw', pa.league_position,
    'prev_won_same_mw', pa.wins, 'prev_drawn_same_mw', pa.draws,
    'prev_lost_same_mw', pa.losses,
    'prev_gf_same_mw', pa.goals_scored, 'prev_ga_same_mw', pa.goals_conceded,
    'prev_points_same_mw', pa.points,
    'prev_final_position', pf.league_position,
    'prev_final_won', pf.wins, 'prev_final_drawn', pf.draws,
    'prev_final_lost', pf.losses,
    'prev_final_gf', pf.goals_scored, 'prev_final_ga', pf.goals_conceded,
    'prev_final_points', pf.points
  ) into v_summary
  from team_gameweek_stats c
  left join team_gameweek_stats pa
    on pa.club_id = v_club.id and pa.season_id = v_prev.id
   and pa.gameweek_number = c.gameweek_number
  left join team_gameweek_stats pf
    on pf.club_id = v_club.id and pf.season_id = v_prev.id
   and pf.gameweek_number = (
     select max(gameweek_number) from team_gameweek_stats
     where club_id = v_club.id and season_id = v_prev.id
   )
  where c.club_id = v_club.id and c.season_id = v_cur.id
    and c.gameweek_number = v_cur_gw;

  select coalesce(jsonb_object_agg(label, positions), '{}'::jsonb) into v_series
  from (
    select s.label,
           jsonb_agg(t.league_position order by t.gameweek_number) as positions
    from team_gameweek_stats t
    join seasons s on s.id = t.season_id
    where t.club_id = v_club.id and s.id in (v_cur.id, v_prev.id)
    group by s.label
  ) x;

  select coalesce(jsonb_object_agg(label, goals), '{}'::jsonb) into v_goals
  from (
    select s.label,
           jsonb_agg(t.goals_scored order by t.gameweek_number) as goals
    from team_gameweek_stats t
    join seasons s on s.id = t.season_id
    where t.club_id = v_club.id and s.id in (v_cur.id, v_prev.id)
    group by s.label
  ) g;

  select coalesce(jsonb_agg(row), '[]'::jsonb) into v_players
  from (
    select jsonb_build_object(
      'player_name', coalesce(p.display_name, p.full_name),
      'goals', coalesce(c.goals, 0),
      'assists', case when c.player_id is null then 0 else c.assists end,
      'appearances', coalesce(c.appearances, 0),
      'prev_goals', coalesce(v.goals, 0),
      'prev_assists', case when v.player_id is null then 0 else v.assists end,
      'prev_appearances', coalesce(v.appearances, 0)
    ) as row
    from players p
    left join player_season_stats c
      on c.player_id = p.id and c.season_id = v_cur.id
    left join player_season_stats v
      on v.player_id = p.id and v.season_id = v_prev.id
    where coalesce(c.club_id, v.club_id, p.club_id) = v_club.id
      and (coalesce(c.goals,0) + coalesce(c.assists,0)
         + coalesce(v.goals,0) + coalesce(v.assists,0)) > 0
    order by coalesce(c.goals,0) desc, coalesce(c.assists,0) desc,
             coalesce(v.goals,0) desc
    limit 20
  ) y;

  select coalesce(jsonb_agg(res order by kickoff_time), '[]'::jsonb) into v_form
  from (
    select m.kickoff_time,
           case
             when (m.home_club_id = v_club.id and m.home_score > m.away_score)
               or (m.away_club_id = v_club.id and m.away_score > m.home_score) then 'W'
             when m.home_score = m.away_score then 'D'
             else 'L'
           end as res
    from matches m
    where m.season_id = v_cur.id
      and m.status = 'completed'
      and (m.home_club_id = v_club.id or m.away_club_id = v_club.id)
    order by m.kickoff_time desc
    limit 6
  ) z;

  -- new: the same run for last season, capped at this season's matchweek
  select coalesce(jsonb_agg(res order by kickoff_time), '[]'::jsonb) into v_form_prev
  from (
    select m.kickoff_time,
           case
             when (m.home_club_id = v_club.id and m.home_score > m.away_score)
               or (m.away_club_id = v_club.id and m.away_score > m.home_score) then 'W'
             when m.home_score = m.away_score then 'D'
             else 'L'
           end as res
    from matches m
    join gameweeks g on g.id = m.gameweek_id
    where m.season_id = v_prev.id
      and m.status = 'completed'
      and g.number <= v_cur_gw
      and (m.home_club_id = v_club.id or m.away_club_id = v_club.id)
    order by m.kickoff_time desc
    limit 6
  ) zp;

  select max(completed_at) into v_last_sync
  from ingestion_runs where status = 'success';

  return jsonb_build_object(
    'team', jsonb_build_object(
      'name', v_club.name,
      'short_name', v_club.short_name,
      'tla', v_club.code,
      'crest', v_club.crest_url,
      'colour', case when v_club.primary_colour_hex is null then null
                     else '#' || v_club.primary_colour_hex end
    ),
    'summary', v_summary,
    'series', v_series,
    'goals_series', v_goals,
    'players', v_players,
    'form', v_form,
    'form_prev', v_form_prev,   -- new
    'seasons', jsonb_build_object('current', v_cur.label, 'previous', v_prev.label),
    'lastSync', v_last_sync
  );
end $function$;
