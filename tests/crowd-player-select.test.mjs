import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const PAGE=fileURLToPath(new URL("../public/crown/crowd/player/index.html",import.meta.url));
const html=readFileSync(PAGE,"utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/i);

test("Da CROWD Player select script parses",()=>{
  assert.ok(match,"Player select script missing");
  assert.doesNotThrow(()=>new Function(match[1]));
});

test("X uses uploaded poster with website-owned overlay formula",()=>{
  assert.match(html,/data-name="X THA GOD"/);
  assert.match(html,/data-image="\/assets\/x-tha-god-character\.jpeg"/);
  assert.match(html,/data-stage-class="poster-stage"/);
  assert.match(html,/data-art-fit="cover"/);
  assert.match(html,/data-art-position="center center"/);
  assert.match(html,/id="stageName">X THA GOD<\/h2>/);
  assert.match(html,/id="startButton"[^>]*>PRESS START \/\/ ENTER LEVEL X<\/a>/);
});

test("X and DeeJayy share the same Player stage dimensions",()=>{
  assert.match(html,/\.stage\.poster-stage\{min-height:700px\}/);
  assert.match(html,/@media\(max-width:720px\)[\s\S]*?\.stage\.poster-stage\{min-height:800px\}/);
  assert.match(html,/data-name="X THA GOD"[\s\S]*?data-stage-class="poster-stage"/);
  assert.match(html,/data-name="DEEJAYY"[\s\S]*?data-stage-class="poster-stage"/);
  assert.match(html,/\.stage-copy\{[^}]*min-height:270px/);
});

test("X fills its full stage while DeeJayy keeps its established art treatment",()=>{
  const script=match?.[1]||"";
  assert.match(html,/data-name="X THA GOD"[\s\S]*?data-art-fit="cover"/);
  assert.match(html,/data-name="DEEJAYY"[\s\S]*?data-art-fit="100% 118%" data-art-position="left center"/);
  assert.match(script,/stage\.classList\.remove\('poster-stage'\)/);
  assert.match(script,/slot\.dataset\.stageClass/);
});
