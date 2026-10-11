import test from "node:test";
import assert from "node:assert/strict";
import {readdirSync,readFileSync,statSync} from "node:fs";
import {join,extname,relative} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const EXECUTABLE_EXTENSIONS=new Set([".js",".mjs",".html"]);
const RETIRED=["preview-"+"recover-user01","PREVIEW_"+"RECOVERY_TOKEN"];

function executableFiles(path){
  const out=[];
  for(const name of readdirSync(path)){
    const full=join(path,name);
    const rel=relative(ROOT,full).replaceAll("\\","/");
    if(rel.startsWith(".git/")||rel.startsWith("node_modules/")||rel.startsWith("SCRYPTUREZ/"))continue;
    const stat=statSync(full);
    if(stat.isDirectory())out.push(...executableFiles(full));
    else if(EXECUTABLE_EXTENSIONS.has(extname(name).toLowerCase()))out.push(full);
  }
  return out;
}

test("temporary Preview recovery mechanism is absent from executable source",()=>{
  const hits=[];
  for(const file of executableFiles(ROOT)){
    const content=readFileSync(file,"utf8");
    for(const retired of RETIRED){
      if(content.includes(retired))hits.push(relative(ROOT,file)+": "+retired);
    }
  }
  assert.deepEqual(hits,[]);
});
