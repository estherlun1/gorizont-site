(() => {
  const modal = document.getElementById('campAuthModal');
  if (!modal) return;
  const openers = [document.getElementById('campAuthOpen'), ...document.querySelectorAll('[data-open-auth]')].filter(Boolean);
  const closeButton = document.getElementById('campAuthClose');
  const registerTab = document.getElementById('authRegisterTab');
  const loginTab = document.getElementById('authLoginTab');
  const registerForm = document.getElementById('authRegisterForm');
  const loginForm = document.getElementById('authLoginForm');
  const status = document.getElementById('authStatus');
  let previousFocus = null;
  function open() { previousFocus = document.activeElement; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; registerForm.querySelector('input').focus(); }
  function close() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(previousFocus) previousFocus.focus(); }
  function tab(which) { const isRegister=which==='register'; registerTab.classList.toggle('active',isRegister); loginTab.classList.toggle('active',!isRegister); registerTab.setAttribute('aria-selected',String(isRegister)); loginTab.setAttribute('aria-selected',String(!isRegister)); registerForm.hidden=!isRegister; loginForm.hidden=isRegister; status.textContent=''; }
  openers.forEach(el=>el.addEventListener('click',open)); closeButton.addEventListener('click',close); registerTab.addEventListener('click',()=>tab('register')); loginTab.addEventListener('click',()=>tab('login'));
  modal.addEventListener('click',e=>{if(e.target===modal)close()}); document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
  // Forms are presentation-only until connected to the deployed Supabase Edge Functions.
  [registerForm,loginForm].forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();status.textContent='Форма готова. Подключение к аккаунтам добавим следующим шагом.';}));
})();
