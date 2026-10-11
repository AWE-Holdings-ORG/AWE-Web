import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {completionPct,normalizePlaybackSignal} from "../lib/player-analytics.js";

test("completion percentage is consumption-based and capped",()=>{
  assert.equal(completionPct(0,600000),0);
  assert.equal(completionPct(300000,600000),50);
  assert.equal(completionPct(900000,600000),100);
  assert.equal(completionPct(120000,null),0);
});

test("playback signal normalization accepts canonical telemetry",()=>{
  const signal=normalizePlaybackSignal({
    mediaId:7,
    sessionKey:"1234567890abcdef",
    activeMs:120000,
    durationMs:600000,
    event:"progress"
  });
  assert.equal(signal.mediaId,7);
  assert.equal(signal.activeMs,120000);
  assert.equal(signal.durationMs,600000);
  assert.equal(signal.completionPct,20);
});

test("playback signal normalization rejects malformed identity",()=>{
  assert.equal(normalizePlaybackSignal({mediaId:0,sessionKey:"short",event:"start"}),null);
  assert.equal(normalizePlaybackSignal({mediaId:1,sessionKey:"1234567890abcdef",event:"fake"}),null);
});

test("LEVEL X analytics dashboard script parses",()=>{
  const path=fileURLToPath(new URL("../public/crown/crowd/level-x/analytics/index.html",import.meta.url));
  const html=readFileSync(path,"utf8");
  const match=html.match(/<script>([\s\S]*?)<\/script>/i);
  assert.ok(match,"analytics dashboard script block missing");
  assert.doesNotThrow(()=>new Function(match[1]));
  assert.match(match[1],/\/api\/crown\/player\/analytics/);
});


test("CROWD VIEW funnel is scoped to tracked playback session keys",()=>{
  const path=fileURLToPath(new URL("../lib/player-analytics.js",import.meta.url));
  const source=readFileSync(path,"utf8");
  assert.match(source,/ps\.session_key=mv\.session_key/);
  assert.match(source,/ps\.media_id=mv\.media_id/);
});


test("analytics access probe is grant-gated before exposing operator UI",()=>{
  const workerPath=fileURLToPath(new URL("../worker-entry.js",import.meta.url));
  const worker=readFileSync(workerPath,"utf8");
  assert.match(worker,/\/api\/crown\/player\/analytics-access/);
  assert.match(worker,/playerAnalyticsAuthorized\(env\.CROWN_DB,Number\(identity\.member\.id\)\)/);
  assert.match(worker,/granted/);
});
