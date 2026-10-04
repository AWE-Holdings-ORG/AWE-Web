import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const WORKER=fileURLToPath(new URL("../worker-entry.js",import.meta.url));
const API=fileURLToPath(new URL("../lib/archivez-api.js",import.meta.url));
const CROWN=fileURLToPath(new URL("../public/crown/crowd/archivez/tha-x-filez/index.html",import.meta.url));
const PUBLIC=fileURLToPath(new URL("../public/crowd/x/index.html",import.meta.url));

const worker=readFileSync(WORKER,"utf8");
const api=readFileSync(API,"utf8");
const crown=readFileSync(CROWN,"utf8");
const pub=readFileSync(PUBLIC,"utf8");

for(const [name,html] of [["crown",crown],["public",pub]]){
  test(name+" Archivez page script parses",()=>{
    const match=html.match(/<script>([\s\S]*?)<\/script>/i);
    assert.ok(match);
    assert.doesNotThrow(()=>new Function(match[1]));
  });
}

test("admin public metadata update is owner-only",()=>{
  assert.match(worker,/\/api\/crown\/archivez\/admin\/public-meta/);
  assert.match(worker,/member\.aw_id!=="AWE-000001"/);
  assert.match(worker,/archive_media_public_meta/);
  assert.match(crown,/EDIT PUBLIC INFO/);
  assert.match(crown,/PUBLIC TITLE/);
  assert.match(crown,/RESET TO SOURCE/);
});

test("public naming overlays raw source title without destroying Dropbox filename",()=>{
  assert.match(api,/const sourceTitle=item\.title/);
  assert.match(api,/const publicTitle=/);
  assert.match(api,/title:publicTitle/);
  assert.match(api,/source_title:provenanceVisible\?sourceTitle:null/);
});

test("likes are Crown-member scoped and toggleable",()=>{
  assert.match(worker,/CREATE TABLE|media_likes/);
  assert.match(worker,/\/api\/crown\/archivez\/like/);
  assert.match(worker,/DELETE FROM media_likes/);
  assert.match(worker,/INSERT OR IGNORE INTO media_likes/);
  assert.match(crown,/♡ LIKE/);
  assert.match(pub,/♡ LIKE/);
});

test("comments are public-readable and Crown-write",()=>{
  assert.match(worker,/\/api\/archivez\/social/);
  assert.match(worker,/\/api\/crown\/archivez\/comments/);
  assert.match(worker,/media_comments/);
  assert.match(pub,/CROWN ID REQUIRED TO COMMENT/);
  assert.match(crown,/POST COMMENT/);
});

test("sharing creates stable DXF deep links",()=>{
  assert.match(crown,/new URL\("\/crowd\/x\/",location\.origin\)/);
  assert.match(crown,/searchParams\.set\("file",x\.collection_file_code/);
  assert.match(pub,/searchParams\.set\("file",x\.collection_file_code/);
  assert.match(pub,/navigator\.share/);
  assert.match(pub,/navigator\.clipboard\.writeText/);
  assert.match(pub,/new URLSearchParams\(location\.search\)\.get\("file"\)/);
});
