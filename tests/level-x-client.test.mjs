import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const LEVEL_X=fileURLToPath(new URL("../public/crown/crowd/level-x/index.html",import.meta.url));
const html=readFileSync(LEVEL_X,"utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/i);

test("LEVEL X inline Player script parses",()=>{
  assert.ok(match,"LEVEL X script block missing");
  assert.doesNotThrow(()=>new Function(match[1]));
});

test("LEVEL X qualified-view wiring requires real playback signals",()=>{
  const script=match?.[1]||"";
  assert.match(script,/QUALIFIED_VIEW_MS\s*=\s*10000/);
  assert.match(script,/YT\.PlayerState\.PLAYING/);
  assert.match(script,/addEventListener\("playing"/);
  assert.match(script,/qualifiedMediaIds\.has\(mediaId\)/);
  assert.match(script,/\/api\/crown\/player\/view/);
});

test("LEVEL X comments honor catalog authorization state",()=>{
  const script=match?.[1]||"";
  assert.match(script,/state\.active\.authorized===false/);
  assert.match(script,/LOCKED SIGNAL \/\/ ENGAGEMENT UNAVAILABLE/);
});
