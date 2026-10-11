# X Tha God — Intake Batch 002 — Video Duration Classification

Status: INTAKE / DURATION PENDING
Date: 2026-10-01
Authority: SCRYPT-XTG-001 v1.2
Source: Dropbox /X Tha God
Mutation Posture: READ-ONLY

## Governing Rule
For X Tha God MOV/MP4 archive files:

- duration <= 120 seconds -> Battle Clip / Promo Clip
- duration > 120 seconds -> Battle Round

Duration determines content form.
Visual review determines matchup/event identity and relationship to an existing verified battle record.

Do not infer type from file size.
Do not infer opponent, event, round number, or chronology from filename alone.

## Batch 002 — First 25 Video Records

| # | Dropbox file ID | Source file | Bytes | Duration | Type | Context |
|---:|---|---|---:|---|---|---|
| 001 | id:jobzSVyDZGwAAAAAAAAECA | Video May 17 2026, 7 10 24 PM.mov | 3701221007 | PENDING | PENDING | Visual confirmation required |
| 002 | id:jobzSVyDZGwAAAAAAAAEBw | Video Apr 06 2026, 5 34 09 AM.mov | 1088679899 | PENDING | PENDING | Visual confirmation required |
| 003 | id:jobzSVyDZGwAAAAAAAAEBg | Video Aug 15 2026, 3 47 17 PM.mov | 318168039 | PENDING | PENDING | Visual confirmation required |
| 004 | id:jobzSVyDZGwAAAAAAAAD-A | Video May 22 2026, 3 45 59 PM.mov | 192135833 | PENDING | PENDING | Visual confirmation required |
| 005 | id:jobzSVyDZGwAAAAAAAAD9A | Video Aug 16 2026, 12 48 23 PM.mov | 38120850 | PENDING | PENDING | Visual confirmation required |
| 006 | id:jobzSVyDZGwAAAAAAAAD8Q | Video May 22 2026, 12 27 33 PM.mov | 144101175 | PENDING | PENDING | Visual confirmation required |
| 007 | id:jobzSVyDZGwAAAAAAAAD7g | Video Aug 14 2026, 4 38 25 PM.mov | 69436103 | PENDING | PENDING | Visual confirmation required |
| 008 | id:jobzSVyDZGwAAAAAAAAD6g | Video May 18 2026, 11 59 54 AM.mov | 109089854 | PENDING | PENDING | Visual confirmation required |
| 009 | id:jobzSVyDZGwAAAAAAAAD6A | Video Apr 08 2026, 12 13 45 PM.mov | 283778551 | PENDING | PENDING | Visual confirmation required |
| 010 | id:jobzSVyDZGwAAAAAAAAD5A | Video Apr 28 2026, 3 11 25 PM.mov | 2914624 | PENDING | PENDING | Visual confirmation required |
| 011 | id:jobzSVyDZGwAAAAAAAAD4w | Video Apr 28 2026, 3 09 34 PM.mov | 4551936 | PENDING | PENDING | Visual confirmation required |
| 012 | id:jobzSVyDZGwAAAAAAAAD4g | Video Apr 28 2026, 4 43 27 AM.mov | 8956892 | PENDING | PENDING | Visual confirmation required |
| 013 | id:jobzSVyDZGwAAAAAAAAD1g | Video Apr 09 2026, 1 29 20 PM.mov | 2832837 | PENDING | PENDING | Visual confirmation required |
| 014 | id:jobzSVyDZGwAAAAAAAADzw | Video Apr 05 2026, 5 44 43 PM.mov | 109258047 | PENDING | PENDING | Visual confirmation required |
| 015 | id:jobzSVyDZGwAAAAAAAADzQ | Video Apr 08 2026, 12 56 41 AM.mov | 51226738 | PENDING | PENDING | Visual confirmation required |
| 016 | id:jobzSVyDZGwAAAAAAAADrg | Video Mar 29 2026, 11 12 46 AM.mov | 970204160 | PENDING | PENDING | Visual confirmation required |
| 017 | id:jobzSVyDZGwAAAAAAAADoA | Video Mar 29 2026, 11 24 26 AM (1).mov | 178570242 | PENDING | PENDING | Visual confirmation required |
| 018 | id:jobzSVyDZGwAAAAAAAADnw | Video Mar 29 2026, 11 19 18 AM.mov | 818423404 | PENDING | PENDING | Visual confirmation required |
| 019 | id:jobzSVyDZGwAAAAAAAADng | Video Mar 29 2026, 11 24 26 AM.mov | 732495252 | PENDING | PENDING | Visual confirmation required |
| 020 | id:jobzSVyDZGwAAAAAAAADnQ | Video Mar 02 2026, 5 01 07 PM.mov | 223412845 | PENDING | PENDING | Visual confirmation required |
| 021 | id:jobzSVyDZGwAAAAAAAADjw | Video Feb 15 2026, 8 07 13 PM.mov | 3893783928 | PENDING | PENDING | Visual confirmation required |
| 022 | id:jobzSVyDZGwAAAAAAAADVQ | Video Feb 27 2026, 6 52 55 AM.mov | 35781040 | PENDING | PENDING | Visual confirmation required |
| 023 | id:jobzSVyDZGwAAAAAAAADVA | Video Feb 24 2026, 10 09 29 PM.mov | 22474019 | PENDING | PENDING | Visual confirmation required |
| 024 | id:jobzSVyDZGwAAAAAAAADUg | Video Feb 16 2026, 9 30 42 PM.mov | 1048460 | PENDING | PENDING | Visual confirmation required |
| 025 | id:jobzSVyDZGwAAAAAAAADTQ | Video Feb 15 2026, 8 16 41 PM.mov | 3232467677 | PENDING | PENDING | Visual confirmation required |

## Intake Procedure
For each record:
1. obtain exact runtime in seconds;
2. classify automatically using the 120-second law;
3. visually inspect enough footage to identify matchup/event when possible;
4. connect the asset to the existing battle identity when appropriate;
5. record whether it is a promo/clip, a battle round, or an alternate/duplicate source;
6. preserve the Dropbox original unchanged.

## Connector Limitation
The current Dropbox metadata/search surface exposes file identity, type and size but not video runtime.

Therefore duration remains PENDING until read from the media file or another authoritative media-metadata source.

File size must not be used as a duration proxy.
