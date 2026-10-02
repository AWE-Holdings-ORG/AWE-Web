# Player Access Resolver Acceptance Cases

Governing SCRYPT: SCRYPT-CROWN-002

These cases are implementation acceptance criteria for lib/player-access.js.

| Case | Viewer | Media | Expected |
|---|---|---|---|
| 01 | Anonymous | PUBLIC | Full media allowed |
| 02 | Anonymous | HOUSE / locked | Teaser only; no source |
| 03 | CYPHERZ + matching House grant | HOUSE | Full media allowed |
| 04 | CYPHERZ without matching House grant | HOUSE / concealed | No record |
| 05 | CYPHERZ + media unlock grant | UNLOCK | Full media allowed |
| 06 | CYPHERZ without unlock | UNLOCK / encrypted | Encrypted signal only |
| 07 | CYPHERZ, no Crown | CROWN / locked | Teaser only; no source |
| 08 | Active Crown session | CROWN | Full media allowed |
| 09 | Crown member without explicit Vault grant | VAULT / concealed | No record |
| 10 | Crown member + explicit Vault media grant | VAULT | Full media allowed |
| 11 | Linked CYPHERZ+Crown; CYPHERZ owns House grant | HOUSE | Full media allowed after union |
| 12 | Linked CYPHERZ+Crown; Crown owns media unlock | UNLOCK | Full media allowed after union |
| 13 | Any viewer | Unknown access state | Deny + conceal |
| 14 | Any viewer | HOUSE with missing house_slug | Deny + conceal |
| 15 | Any unauthorized viewer | Any protected state | No provider/external_id/canonical_url/source_url/native URL |
