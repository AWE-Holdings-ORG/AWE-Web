import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const PAGE=fileURLToPath(new URL("../public/crown/crowd/player/index.html",import.meta.url));
const html=readFileSync(PAGE,"utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/i);
const script=match?.[1]||"";

test("Da CROWD Player select script parses",()=>{
  assert.ok(match,"Player select script missing");
  assert.doesNotThrow(()=>new Function(script));
});

test("X uses the full-floor poster formula",()=>{
  assert.match(html,/data-name="X THA GOD"/);
  assert.match(html,/data-image="\/assets\/x-tha-god-character\.jpeg"/);
  assert.match(html,/data-stage-class="poster-stage"/);
  assert.match(html,/data-art-fit="cover"/);
  assert.match(html,/\.stage\.poster-stage\{min-height:960px;aspect-ratio:4\/5\}/);
  assert.match(html,/@media\(max-width:720px\)[\s\S]*?\.stage\.poster-stage\{min-height:820px/);
  assert.match(html,/\.stage-copy\{[^}]*min-height:270px/);
});

test("CROWD fallback roster contains X and Big Tali but not DeeJayy",()=>{
  assert.match(html,/data-name="X THA GOD"/);
  assert.match(html,/data-name="BIG TALI"/);
  assert.doesNotMatch(html,/data-name="DEEJAYY"/);
  assert.match(html,/THE CROWD \/\/ STARDOM/);
});

test("Player loads member-specific roster data",()=>{
  assert.match(script,/\/api\/crown\/player\/roster\?house=the-crowd/);
  assert.match(script,/function renderRoster\(signals\)/);
  assert.match(script,/unlockSource==='cheat-code'/);
  assert.match(script,/unlockSource==='legacy-preview'/);
  assert.match(script,/PERSONAL ROSTER/);
});

test("Cheat Code terminal is wired to the authenticated CROWD endpoint",()=>{
  assert.match(html,/CHEAT CODE \/\/ HIDDEN SIGNAL/);
  assert.match(html,/id="cheatForm"/);
  assert.match(html,/id="cheatCode"/);
  assert.match(script,/\/api\/crown\/player\/cheat/);
  assert.match(script,/houseSlug:'the-crowd'/);
  assert.match(script,/CHEAT ACCEPTED/);
});
