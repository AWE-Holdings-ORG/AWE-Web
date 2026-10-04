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
  assert.match(html,/data-stage-class="x-poster"/);
  assert.match(html,/data-art-fit="auto 100%"/);
  assert.match(html,/data-art-position="left top"/);
  assert.match(html,/id="stageName">X THA GOD<\/h2>/);
  assert.match(html,/id="startButton"[^>]*>PRESS START \/\/ ENTER LEVEL X<\/a>/);
});

test("X poster gets extra responsive height without changing DeeJayy art formula",()=>{
  assert.match(html,/\.stage\.x-poster\{min-height:700px\}/);
  assert.match(html,/@media\(max-width:720px\)[\s\S]*?\.stage\.x-poster\{min-height:800px\}/);
  assert.match(html,/data-name="DEEJAYY"[\s\S]*?data-art-fit="100% 118%" data-art-position="left center"/);
});

test("X and DeeJayy keep independent stage treatments",()=>{
  const script=match?.[1]||"";
  assert.match(script,/stage\.classList\.remove\('x-poster'\)/);
  assert.match(script,/slot\.dataset\.stageClass/);
});
