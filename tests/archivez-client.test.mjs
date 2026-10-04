import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const HUB=fileURLToPath(new URL("../public/crown/crowd/archivez/index.html",import.meta.url));
const XFILEZ=fileURLToPath(new URL("../public/crown/crowd/archivez/tha-x-filez/index.html",import.meta.url));
const CROWD=fileURLToPath(new URL("../public/crown/crowd/index.html",import.meta.url));
const WORKER=fileURLToPath(new URL("../worker-entry.js",import.meta.url));
const API=fileURLToPath(new URL("../lib/archivez-api.js",import.meta.url));
const PLAYER_API=fileURLToPath(new URL("../lib/player-api.js",import.meta.url));
const SERVICE=fileURLToPath(new URL("../lib/player-catalog-service.js",import.meta.url));

const hub=readFileSync(HUB,"utf8");
const xfilez=readFileSync(XFILEZ,"utf8");
const crowd=readFileSync(CROWD,"utf8");
const worker=readFileSync(WORKER,"utf8");
const api=readFileSync(API,"utf8");
const playerApi=readFileSync(PLAYER_API,"utf8");
const service=readFileSync(SERVICE,"utf8");
const match=xfilez.match(/<script>([\s\S]*?)<\/script>/i);

test("The CROWD button 06 opens Da Archivez",()=>{
  assert.match(crowd,/06 \/\/ DA ARCHIVEZ/);
  assert.match(crowd,/href="\/crown\/crowd\/archivez\/"/);
  assert.doesNotMatch(crowd,/06 \/\/ ARCHIVES/);
});

test("Da Archivez directory owns Tha X Filez",()=>{
  assert.match(hub,/DA ARCHIVEZ/);
  assert.match(hub,/Tha X Filez/);
  assert.match(hub,/href="\/crown\/crowd\/archivez\/tha-x-filez\/"/);
  assert.match(hub,/Archivez are separate from Da CROWD Player/);
});

test("Tha X Filez Archive Player script parses",()=>{
  assert.ok(match,"Tha X Filez Archive Player script missing");
  assert.doesNotThrow(()=>new Function(match[1]));
  assert.match(xfilez,/ARCHIVE PLAYER \/\/ THA X FILEZ/);
  assert.match(xfilez,/PUBLIC FILE/);
  assert.match(xfilez,/VAULT FILE/);
});

test("Tha X Filez consumes the Crown Archivez API only",()=>{
  const script=match?.[1]||"";
  assert.match(script,/\/api\/crown\/archivez\/catalog\?artist=x-tha-god&collection=tha-x-filez/);
  assert.doesNotMatch(script,/\/api\/crown\/player\/catalog/);
  assert.match(script,/collection_file_code/);
});

test("Archivez API is a separate route surface with shared access enforcement",()=>{
  assert.match(worker,/url\.pathname==="\/api\/crown\/archivez\/catalog"/);
  assert.match(worker,/url\.pathname==="\/api\/archivez\/catalog"/);
  assert.match(worker,/archivezCatalogResponse/);
  assert.match(api,/collectionSlug=url\.searchParams\.get\("collection"\)\|\|"tha-x-filez"/);
  assert.match(api,/buildPlayerCatalog/);
  assert.match(api,/collectionSlug/);
  assert.match(service,/collectionSlug=null/);
  assert.match(service,/const scoped=\(collectionSlug/);
});

test("Crown Archivez route requires Crown identity while public Archivez does not",()=>{
  const crownRoute=worker.match(/if\(url\.pathname==="\/api\/crown\/archivez\/catalog"[\s\S]*?\n    \}/)?.[0]||"";
  const publicRoute=worker.match(/if\(url\.pathname==="\/api\/archivez\/catalog"[\s\S]*?\n    \}/)?.[0]||"";
  assert.match(crownRoute,/crownIdentity\(request,env\)/);
  assert.match(crownRoute,/surface:"crown"/);
  assert.doesNotMatch(publicRoute,/crownIdentity\(request,env\)/);
  assert.match(publicRoute,/surface:"public"/);
});

test("Da CROWD Player API excludes Tha X Filez server-side",()=>{
  assert.match(playerApi,/excludeCollectionSlugs:\["tha-x-filez"\]/);
  assert.match(service,/excludeCollectionSlugs=\[\]/);
  assert.match(service,/const excluded=new Set/);
});

test("Tha X Filez scales its Crown queue and never exposes storage sources to normal viewers",()=>{
  const script=match?.[1]||"";
  assert.match(script,/pageSize:60/);
  assert.match(script,/pagePrev/);
  assert.match(script,/pageNext/);
  assert.match(script,/preview_url/);
  assert.match(script,/thumb_url/);
  assert.match(script,/provenance_visible===true/);
  assert.match(xfilez,/SOURCE ADMIN ↗/);
  assert.doesNotMatch(script,/DROPBOX SOURCE/);
  assert.doesNotMatch(script,/\/\/ '+esc\(String\(x\.provider/);
});

test("Archivez API redacts Drive/Dropbox provenance unless owner",()=>{
  assert.match(api,/provenanceVisible=member\?\.aw_id==="AWE-000001"/);
  assert.match(api,/delete delivery\.canonical_url/);
  assert.match(api,/delete delivery\.source_url/);
  assert.match(api,/delete delivery\.source_name/);
  assert.match(api,/delete delivery\.provider/);
  assert.match(api,/preview_url/);
  assert.match(api,/thumb_url/);
});

test("Archivez media is proxied through AWE endpoints",()=>{
  assert.match(worker,/url\.pathname==="\/api\/crown\/archivez\/media"/);
  assert.match(worker,/url\.pathname==="\/api\/archivez\/media"/);
  assert.match(worker,/archiveMediaProxyResponse/);
  assert.match(worker,/dropboxRawUrl/);
  assert.match(worker,/driveThumbnailUrl/);
  assert.match(worker,/driveDownloadUrl/);
});
