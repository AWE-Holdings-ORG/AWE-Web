# SCRYPT-CROWN-004-QA-002 — Latest Preview Runtime Pass

Status: READY TO RUN
Date: 2026-10-01
Branch: feature/crown-door-v1
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-004, SCRYPT-CROWN-006

## Purpose
Complete the browser/runtime checks that cannot be proven from repository source, GitHub CI, or Cloudflare build status alone.

This pass must run against the feature Preview, never production.

## Preconditions
1. Open the feature Preview.
2. Use the normal Crown UI to end any stale session if needed.
3. Authenticate normally as User 01 with Crown Name Nitti_Bo and the current PCK.
4. Do not use or recreate the retired Preview recovery mechanism.

## Read-Only Console Smoke
After normal Crown authentication, open DevTools Console on the feature Preview and paste the block below.

It:
- checks Crown health;
- confirms the retired recovery path does not behave as a recovery handler;
- checks Player access-health;
- validates the X Tha God catalog count and unique source IDs;
- confirms comments can be read for an authorized battle;
- checks any already-returned locked teaser for source redaction and engagement denial;
- does not post a comment or record a CROWD VIEW.

```js
(async()=>{
  const rows=[];
  const push=(name,pass,detail)=>rows.push({check:name,result:pass?"PASS":"FAIL",detail});

  async function getJson(path,options){
    const response=await fetch(path,options);
    const text=await response.text();
    let data=null;
    try{data=JSON.parse(text)}catch{}
    return {response,text,data};
  }

  const health=await getJson("/api/crown/health");
  push(
    "Crown health",
    health.response.ok &&
      health.data?.ok===true &&
      health.data?.db===true &&
      health.data?.pckPepper===true &&
      health.data?.sessionPepper===true &&
      health.data?.pbkdf2Iterations===100000,
    `HTTP ${health.response.status} // ${health.text.slice(0,180)}`
  );

  const retiredPath="/api/crown/preview-"+"recover-user01";
  const retired=await getJson(retiredPath,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:"{}"
  });
  const retiredLooksActive=
    retired.response.ok ||
    /recover(?:y|ed)|re-?key|new pck|temporary token/i.test(retired.text);
  push(
    "Retired recovery handler absent",
    !retiredLooksActive,
    `HTTP ${retired.response.status} // ${retired.text.slice(0,180)}`
  );

  const access=await getJson("/api/crown/player/access-health");
  const required=["media_access_policy","cypherz_house_access","media_unlock_grants"];
  push(
    "Player access-health",
    access.response.ok &&
      access.data?.ok===true &&
      access.data?.schemaReady===true &&
      access.data?.mode==="SCRYPT-CROWN-002" &&
      required.every(name=>(access.data?.tables||[]).includes(name)),
    `HTTP ${access.response.status} // mode=${access.data?.mode} // tables=${(access.data?.tables||[]).join(",")}`
  );

  const catalog=await getJson("/api/crown/player/catalog?artist=x-tha-god");
  const media=Array.isArray(catalog.data?.media)?catalog.data.media:[];
  const externalIds=media.map(x=>x.external_id).filter(Boolean);
  const authorizedBattles=media.filter(x=>x.media_type==="battle"&&x.authorized===true);
  push(
    "LEVEL X 18-battle catalog",
    catalog.response.ok &&
      authorizedBattles.length===18 &&
      new Set(externalIds).size===18,
    `HTTP ${catalog.response.status} // media=${media.length} // authorized battles=${authorizedBattles.length} // unique source IDs=${new Set(externalIds).size}`
  );

  const first=authorizedBattles[0];
  if(first){
    const comments=await getJson("/api/crown/player/comments?mediaId="+encodeURIComponent(first.id));
    push(
      "Authorized comments read",
      comments.response.ok && Array.isArray(comments.data?.comments),
      `HTTP ${comments.response.status} // mediaId=${first.id} // comments=${comments.data?.comments?.length??"?"}`
    );
  }else{
    push("Authorized comments read",false,"No authorized battle returned.");
  }

  const locked=media.find(x=>x.authorized===false);
  if(locked){
    const noSource=
      locked.provider===undefined &&
      locked.external_id===undefined &&
      locked.canonical_url===undefined &&
      locked.source_url===undefined;
    const denied=await getJson("/api/crown/player/comments?mediaId="+encodeURIComponent(locked.id));
    push(
      "Existing locked-media redaction",
      noSource && denied.response.status===404,
      `mediaId=${locked.id} // sourceRedacted=${noSource} // engagement HTTP ${denied.response.status}`
    );
  }else{
    rows.push({
      check:"Existing locked-media redaction",
      result:"SKIP",
      detail:"No restricted teaser is currently returned to this Crown. Do not alter Preview D1 solely to fabricate one."
    });
  }

  console.table(rows);
  window.__AWE_CROWN_QA={rows,health:health.data,access:access.data,catalog:catalog.data};
  console.log("AWE Crown QA results saved to window.__AWE_CROWN_QA");
})();
```

## LEVEL X Playback / Qualified CROWD VIEW

Open:

`/crown/crowd/level-x/`

Use one authorized battle and note its starting CROWD VIEW count.

1. Select the battle but do not press Play for at least 12 seconds.
   - PASS: view count does not change.
2. Play for about 5 seconds, then pause.
   - PASS: view count does not change.
3. Resume playback until cumulative active playback exceeds 10 seconds.
   - PASS: view count increments exactly once.
4. Continue playing for at least another 12 seconds.
   - PASS: no second increment occurs.
5. Switch to another battle, then return to the already-qualified battle and play another 10+ seconds in the same Player page session.
   - PASS: no second POST/count increment occurs for that media/session key.
6. Select a different battle and switch away before 10 active seconds.
   - PASS: the abandoned battle does not increment.

Buffering/waiting time must not count toward qualification.

## 18-Battle Embed Pass

The repository/CI gate verifies all 18 seeded records, IDs, order, CROWN state, and idempotence. The browser pass verifies the embeds themselves.

In the BATTLES filter, step through all 18 queue entries:
- confirm each selected title matches the queue item;
- confirm the YouTube player loads rather than showing an embed restriction/error;
- start each battle briefly to confirm playback can begin.

Record any failing title and the on-screen YouTube error exactly. Do not replace a source URL until the failure is confirmed.

## Comments Write Pass

On one authorized battle:
1. load comments;
2. post one comment that is acceptable to remain in the real Preview dataset;
3. confirm it appears immediately with the active Crown identity;
4. reload the battle and confirm the comment remains visible.

Do not post a disposable comment that would require direct D1 cleanup.

## Pass Gate

The Preview promotion gate remains open until:
- normal PCK login passes on the latest Preview;
- Read-Only Console Smoke has no FAIL rows;
- all 18 battle embeds load/start;
- SCRYPT-CROWN-006 qualified-view sequence passes;
- comment write persistence passes;
- locked-media runtime redaction passes when a legitimate restricted test record is available.

A SKIP for locked-media runtime redaction is acceptable only while no legitimate restricted Preview item exists. Resolver tests and server enforcement remain mandatory in CI regardless.
