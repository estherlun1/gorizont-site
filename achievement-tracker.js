import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const URL="https://jrvukdqqrmfjbtskrayy.supabase.co";
const KEY="sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";
const client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"gorizont-auth-session"}});
let queue=[],showing=false;
function toast(item){
 queue.push(item); if(showing)return; showing=true;
 const next=()=>{const data=queue.shift();if(!data){showing=false;return;}
  const node=document.createElement("div");node.style.cssText="position:fixed;z-index:99999;right:18px;bottom:18px;max-width:min(360px,calc(100vw - 36px));padding:13px 16px;border-radius:16px;background:#244d3b;color:#fff8e8;box-shadow:0 8px 30px #142b2090;font:700 14px/1.4 Arial,sans-serif;display:flex;align-items:center;gap:10px";
  if(data.icon_path){const img=document.createElement("img");img.src=new URL("/gorizont-site/"+String(data.icon_path).replace(/^\\/+/, ""),window.location.origin).href;img.alt="";img.style.cssText="width:54px;height:54px;object-fit:contain";img.onerror=()=>{img.remove();const fallback=document.createElement("span");fallback.textContent="🏅";fallback.style.fontSize="38px";node.prepend(fallback);};node.appendChild(img);}
  const text=document.createElement("span");text.textContent="Достижение открыто: "+data.name+" · +"+data.reward_points+" горизонтиков";node.appendChild(text);document.body.appendChild(node);
  setTimeout(()=>{node.remove();setTimeout(next,300);},7000);
 };next();
}
async function track(event){
 try{
  const {data:{session}}=await client.auth.getSession();if(!session?.access_token)return;
  const res=await fetch(URL+"/functions/v1/gorizont-social-achievements",{method:"POST",headers:{"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer "+session.access_token},body:JSON.stringify({action:"achievement",event,event_key:crypto.randomUUID()})});
  const result=await res.json();if(!res.ok)throw new Error(result.error||"Achievement event failed");
  (result.unlocked||[]).forEach(toast);
  if((result.unlocked||[]).length)window.dispatchEvent(new CustomEvent("gorizont:points-updated"));
 }catch(e){console.warn("Achievement tracking:",e);}
}
window.GorizontAchievements={track};
window.addEventListener("gorizont:map-hunt-completed",()=>track("map_run_completed"));
document.addEventListener("click",event=>{if(event.target.closest(".camp-hotspot-fire"))track("fires_button_clicked");});
