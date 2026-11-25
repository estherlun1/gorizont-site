(function(){
  "use strict";
  const SUPABASE_URL="https://jrvukdqqrmfjbtskrayy.supabase.co";
  const SUPABASE_KEY="sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";
  const jobs=[];
  let running=false;
  let clientPromise=null;
  const makeKey=()=>window.crypto?.randomUUID?.()||("event-"+Date.now()+"-"+Math.random().toString(36).slice(2));
  function getClient(){
    if(!clientPromise)clientPromise=import("https://esm.sh/@supabase/supabase-js@2").then(({createClient})=>createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"gorizont-auth-session"}}));
    return clientPromise;
  }
  function toast(item){
    const node=document.createElement("div");
    node.style.cssText="position:fixed;z-index:99999;right:18px;bottom:18px;max-width:min(360px,calc(100vw - 36px));padding:13px 16px;border-radius:16px;background:#244d3b;color:#fff8e8;box-shadow:0 8px 30px #142b2090;font:700 14px/1.4 Arial,sans-serif;display:flex;align-items:center;gap:10px";
    if(item.icon_path){
      const img=document.createElement("img");
let iconPath=String(item.icon_path);while(iconPath.startsWith("/"))iconPath=iconPath.slice(1);img.src=new URL("/gorizont-site/"+iconPath,window.location.origin).href;
      img.alt="";img.style.cssText="width:54px;height:54px;object-fit:contain";
      img.onerror=()=>{img.remove();const fallback=document.createElement("span");fallback.textContent="🏅";fallback.style.fontSize="38px";node.prepend(fallback);};
      node.appendChild(img);
    }
    const label=document.createElement("span");
    label.textContent="Достижение открыто: "+item.name+" · +"+item.reward_points+" горизонтиков";
    node.appendChild(label);document.body.appendChild(node);
    setTimeout(()=>node.remove(),7000);
  }
  async function flush(){
    if(running)return;
    running=true;
    while(jobs.length){
      const job=jobs[0];
      try{
        const client=await getClient();
        const {data:{session},error:sessionError}=await client.auth.getSession();
        if(sessionError)throw sessionError;
        if(!session?.access_token){job.resolve({skipped:true,reason:"no-session"});jobs.shift();continue;}
        const response=await fetch(SUPABASE_URL+"/functions/v1/gorizont-social-achievements",{
          method:"POST",
          headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":"Bearer "+session.access_token},
          body:JSON.stringify({action:"achievement",event:job.event,event_key:job.key})
        });
        const result=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(result.error||("HTTP "+response.status));
        (result.unlocked||[]).forEach(toast);
        if((result.unlocked||[]).length)window.dispatchEvent(new CustomEvent("gorizont:points-updated"));
        job.resolve(result);
      }catch(error){
        console.warn("Achievement tracking:",job.event,error);
        job.resolve({error:String(error?.message||error)});
      }
      jobs.shift();
    }
    running=false;
  }
  function track(event,eventKey){
    if(!event)return Promise.resolve({skipped:true});
    return new Promise(resolve=>{jobs.push({event:String(event),key:eventKey||makeKey(),resolve});void flush();});
  }
  window.GorizontAchievements={track};
  window.addEventListener("gorizont:map-hunt-completed",()=>track("map_run_completed"));
  document.addEventListener("click",event=>{if(event.target.closest(".camp-hotspot-fire"))track("fires_button_clicked");});
})();