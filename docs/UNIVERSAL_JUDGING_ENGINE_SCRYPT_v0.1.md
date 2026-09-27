# UNIVERSAL JUDGING ENGINE SCRYPT v0.1

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
- ballot
- voter_id
- window_open_at
- window_close_at
- vote_locked_at
- result_visibility

## Archived mode
- voting_window = continuous
- one ballot per authenticated voter_id
- no ballot edits after vote_locked_at
- duplicate prevention is server-side
- results can update continuously

## Live mode
- voting_window = 300 seconds
- window opens after final round / competition end signal
- window timestamps come from server, not viewer device
- one ballot per authenticated voter_id
- edits prohibited after submission
- votes after window_close_at rejected
- result_visibility may be hidden_until_close

## Category profiles
Battle Rap default:
- Writing / Bars
- Delivery
- Performance
- Rebuttals / Freestyle
- Crowd Control / Impact

Partner platforms may define their own category profile without changing the core ballot engine.

Examples:
- MetaVerzuz: song selection, impact, performance, matchup response, overall round
- The MadHouse: configurable music-versus criteria
- Producer battles: composition, originality, mix, impact, replay value

## Future API principle
The Crowd House, CROWD SHYT app and approved partner experiences should call the same judging service so rules and results remain consistent across interfaces.
