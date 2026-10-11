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

test("Archivez public metadata update is scoped to authorized House media admins",()=>{
  assert.match(worker,/\/api\/crown\/archivez\/admin\/public-meta/);
  assert.match(worker,/houseAdminCapabilities/);
  assert.match(worker,/canEditPublicMeta/);
  assert.match(worker,/THE CROWD MEDIA ADMIN ACCESS REQUIRED/);
  assert.match(worker,/archive_media_public_meta/);
  assert.match(crown,/THE CROWD \/\/ MEDIA ADMIN/);
  assert.match(crown,/EDIT PUBLIC INFO/);
  assert.match(crown,/PUBLIC TITLE/);
  assert.match(crown,/SAVE \+ NEXT/);
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

test("public metadata overlay avoids giant D1 IN bind lists",()=>{
  assert.match(api,/SELECT media_id,public_title,public_caption,updated_at FROM archive_media_public_meta/);
  assert.doesNotMatch(api,/WHERE media_id IN/);
  assert.doesNotMatch(api,/chunk\.map\(\(\)=>"\?"\)/);
});

test("Crown Archivez images use full-frame image mode",()=>{
  assert.match(crown,/\.screen\.image-mode\{aspect-ratio:auto/);
  assert.match(crown,/max-height:calc\(78vh - 20px\)/);
  assert.match(crown,/screen\.classList\.toggle\("image-mode",isImage\)/);
  assert.match(crown,/screen\.classList\.toggle\("video-mode",isVideo\)/);
});

test("Archivez social controls use Crown styling",()=>{
  assert.match(crown,/\.social-actions button\{/);
  assert.match(crown,/\.admin-edit\{/);
  assert.match(crown,/\.comment-form textarea/);
});


test("scoped media admin sees source filename without provider provenance",()=>{
  assert.match(api,/canViewSourceTitle/);
  assert.match(api,/source_title:adminCapabilities\.canViewSourceTitle\?sourceTitle:null/);
  assert.match(api,/provenance_visible:provenanceVisible/);
  assert.match(api,/admin_role:adminCapabilities\.role/);
  assert.match(api,/admin_editable:adminCapabilities\.canEditPublicMeta/);
});
