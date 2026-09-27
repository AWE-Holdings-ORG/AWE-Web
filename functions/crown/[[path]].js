import {notFound,requireEntitlement} from "../_lib/crown.js";

const PUBLIC_CROWN_PATHS=new Set([
  "/crown",
  "/crown/",
  "/crown/index.html",
  "/crown/crown.css",
  "/crown/crown.js"
]);

function entitlementFor(pathname){
  if(pathname.startsWith("/crown/crowd"))return "crowd";
  if(pathname.startsWith("/crown/archives"))return "crowd";
  return null;
}

export async function onRequest(context){
  const pathname=new URL(context.request.url).pathname;
  if(PUBLIC_CROWN_PATHS.has(pathname))return context.next();

  const entitlement=entitlementFor(pathname);
  if(!entitlement)return notFound();

  const allowed=await requireEntitlement(context,entitlement);
  if(!allowed)return notFound();

  return context.next();
}
