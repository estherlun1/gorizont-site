(function(){
  const sections=[...document.querySelectorAll('[data-scene]')];
  if(!sections.length)return;
  let active='';
  const setScene=(name,el)=>{
    if(name===active)return;
    document.body.dataset.scene=name; active=name;
    sections.forEach(s=>s.classList.toggle('scene-active',s===el));
    window.dispatchEvent(new CustomEvent('gorizont:scene',{detail:{name,element:el}}));
  };
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting && e.intersectionRatio>.45)setScene(e.target.dataset.scene,e.target);});
  },{threshold:[.45,.7]});
  sections.forEach(s=>io.observe(s));
  window.addEventListener('gorizont:scene',e=>{
    const m=document.querySelector('.mascot-host'); if(!m)return;
    m.dataset.scene=e.detail.name;
  });
})();
