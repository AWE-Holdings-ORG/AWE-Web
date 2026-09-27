# UNIVERSAL JUDGING ENGINE SCRYPT v0.2

## Principle
The engine is competition-agnostic. Battle rap is the first implementation, not the limit.

## Core entities
- platform
- event
- competition
- competitor_a
- competitor_b
- format
- rounds
- judging_categories
- category_max_points
- ballot
- voter_id
- competitor_scores
- competitor_totals
- winner
- window_open_at
- window_close_at
- vote_locked_at
- result_visibility

## Battle Rap scoring law
Default Crowd battle-rap card:
- Writing / Bars — 10 points
- Delivery — 10 points
- Performance — 10 points
- Rebuttals / Freestyle — 10 points
- Crowd Control / Impact — 10 points

Each competitor is scored independently in all five categories.
Perfect score per competitor = 50 points.
The scorecard decision is derived from the two totals.
An exact tie remains a tie card unless a future competition-specific rule defines a tiebreaker.

## Archived mode
- voting_window = continuous
- one ballot per authenticated voter_id
- all category scores required before submission
- no ballot edits after vote_locked_at
- duplicate prevention is server-side
- results can update continuously

## Live mode
- voting_window = 300 seconds
- window opens after final round / competition end signal
- window timestamps come from server, not viewer device
- one ballot per authenticated voter_id
- all required scores must be submitted before the deadline
- edits prohibited after submission
- votes after window_close_at rejected
- result_visibility may be hidden_until_close

## Category profiles
Partner platforms may define their own category names and point ceilings without changing the core ballot engine.

Examples:
- MetaVerzuz: song selection, impact, performance, matchup response, overall round
- The MadHouse: configurable music-versus criteria
- Producer battles: composition, originality, mix, impact, replay value

## Future API principle
The Crowd House, CROWD SHYT app and approved partner experiences should call the same judging service so rules, identity, timers, ballot locks and results remain consistent across interfaces.
