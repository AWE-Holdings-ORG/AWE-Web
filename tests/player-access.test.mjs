import assert from "node:assert/strict";
import {resolveAndSanitizeMedia} from "../lib/player-access.js";

const sensitive={
  provider:"youtube",
  external_id:"SECRET",
  canonical_url:"https://protected.invalid/media",
  source_url:"https://protected.invalid/source",
  source_name:"protected-source",
  rights_status:"private"
};

const media=(id,access_state,teaser_mode="locked",extra={})=>({
  id,media_type:"battle",title:"Test Signal",access_state,teaser_mode,...sensitive,...extra
});

function one(item,viewer={}){
  const rows=resolveAndSanitizeMedia([item],viewer);
  return rows[0]??null;
}

assert.equal(one(media(1,"public","visible"))?.canonical_url,sensitive.canonical_url);

{
  const row=one(media(2,"house","locked",{house_slug:"the-crowd"}));
  assert.equal(row?.locked,true);
  assert.equal("canonical_url" in row,false);
  assert.equal("provider" in row,false);
  assert.equal("external_id" in row,false);
  assert.equal("source_url" in row,false);
}

assert.equal(
  one(media(3,"house","locked",{house_slug:"the-crowd"}),{houseSlugs:["the-crowd"]})?.authorized,
  true
);

assert.equal(
  one(media(4,"house","concealed",{house_slug:"the-crowd"})),
  null
);

assert.equal(
  one(media(5,"unlock"),{unlockedMediaIds:[5]})?.authorized,
  true
);

{
  const row=one(media(6,"unlock","encrypted",{unlock_slug:"x-rare"}));
  assert.equal(row?.title,"ENCRYPTED SIGNAL");
  assert.equal("canonical_url" in row,false);
  assert.equal("provider" in row,false);
}

assert.equal(one(media(7,"crown","locked"))?.locked,true);
assert.equal(one(media(8,"crown"),{crownAuthenticated:true})?.authorized,true);

assert.equal(
  one(media(9,"vault","concealed"),{crownAuthenticated:true}),
  null
);

assert.equal(
  one(media(10,"vault","concealed"),{crownAuthenticated:true,unlockedMediaIds:[10]})?.authorized,
  true
);

assert.equal(one(media(11,"unknown","visible")),null);
assert.equal(one(media(12,"house","visible")),null);

console.log("PASS: Player access resolver fail-closed acceptance checks");
