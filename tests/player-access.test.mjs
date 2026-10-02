import test from "node:test";
import assert from "node:assert/strict";
import {resolveAndSanitizeMedia} from "../lib/player-access.js";

const media=(state,teaser="locked",extra={})=>({
  id:1,
  media_type:"battle",
  title:"Secret Battle",
  access_state:state,
  teaser_mode:teaser,
  provider:"youtube",
  external_id:"abc",
  canonical_url:"https://example.com/watch",
  source_url:"https://example.com/source",
  thumbnail_url:"https://example.com/thumb.jpg",
  ...extra
});
const one=(item,viewer={})=>resolveAndSanitizeMedia([item],viewer)[0];

test("PUBLIC returns full source",()=>{
  const r=one(media("public","visible"));
  assert.equal(r.authorized,true);
  assert.equal(r.canonical_url,"https://example.com/watch");
});
test("HOUSE without grant returns teaser but no source",()=>{
  const r=one(media("house","locked",{house_slug:"the-crowd"}));
  assert.equal(r.authorized,false);
  assert.equal(r.canonical_url,undefined);
  assert.equal(r.provider,undefined);
});
test("HOUSE with matching grant returns full source",()=>{
  const r=one(media("house","locked",{house_slug:"the-crowd"}),{houseSlugs:["the-crowd"]});
  assert.equal(r.authorized,true);
  assert.equal(r.external_id,"abc");
});
test("concealed HOUSE is omitted",()=>{
  assert.equal(one(media("house","concealed",{house_slug:"the-crowd"})),undefined);
});
test("UNLOCK grant returns full source",()=>{
  const r=one(media("unlock","locked"),{unlockedMediaIds:[1]});
  assert.equal(r.authorized,true);
});
test("encrypted UNLOCK redacts title, art and source",()=>{
  const r=one(media("unlock","encrypted"));
  assert.equal(r.title,"ENCRYPTED SIGNAL");
  assert.equal(r.canonical_url,undefined);
  assert.equal(r.thumbnail_url,null);
});
test("CROWN requires active Crown authentication",()=>{
  const r=one(media("crown","locked"));
  assert.equal(r.authorized,false);
  assert.equal(r.canonical_url,undefined);
});
test("active Crown authentication returns CROWN source",()=>{
  const r=one(media("crown","locked"),{crownAuthenticated:true});
  assert.equal(r.authorized,true);
});
test("VAULT stays concealed for Crown without explicit media grant",()=>{
  assert.equal(one(media("vault","concealed"),{crownAuthenticated:true}),undefined);
});
test("explicit VAULT media grant returns full source",()=>{
  const r=one(media("vault","concealed"),{crownAuthenticated:true,unlockedMediaIds:[1]});
  assert.equal(r.authorized,true);
});
test("unknown state fails closed",()=>{
  assert.equal(one(media("banana","visible")),undefined);
});
test("HOUSE missing required house_slug fails closed",()=>{
  assert.equal(one(media("house","visible")),undefined);
});
