// Smooth scroll
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});

// Scrollspy
const navLinks = [...document.querySelectorAll('header .nav a[href^="#"]')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const i = sections.indexOf(entry.target);
    if (i >= 0) {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks[i].classList.add('active');
      }
    }
  });
}, { threshold: 0.6 });
sections.forEach(s => spy.observe(s));

// Reveal on view
const rev = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ if (en.isIntersecting) en.target.classList.add('reveal'); });
},{ threshold: .18 });
document.querySelectorAll('.section, .card, .track, .concert').forEach(el=>{
  el.classList.add('reveal-init'); rev.observe(el);
});

// Gradient Mesh background
(function mesh(){
  const c = document.createElement('canvas'); c.id='mesh'; document.body.appendChild(c);
  const ctx = c.getContext('2d'); let w,h,dpr;
  let nodes = [];
  function reset(){
    dpr = Math.max(1, window.devicePixelRatio||1);
    w = c.clientWidth = window.innerWidth; h = c.clientHeight = window.innerHeight;
    c.width = Math.round(w*dpr); c.height = Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    nodes = Array.from({length: 8}, ()=> ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()*2-1)*0.3, vy:(Math.random()*2-1)*0.3,
      r: 220 + Math.random()*160,
      color: `hsla(${Math.random()*360},80%,60%,0.08)`
    }));
  } reset(); addEventListener('resize', reset);
  function tick(){
    ctx.clearRect(0,0,w,h);
    nodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy;
      if(n.x< -n.r|| n.x> w+n.r) n.vx*=-1;
      if(n.y< -n.r|| n.y> h+n.r) n.vy*=-1;
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grd.addColorStop(0, n.color);
      grd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(tick);
  } tick();
})();

// Grain layer
(function grain(){
  const c = document.createElement('canvas'); c.id='grain'; document.body.appendChild(c);
  const ctx = c.getContext('2d'); let w,h,dpr;
  function reset(){
    dpr = Math.max(1, window.devicePixelRatio||1);
    w = c.clientWidth = window.innerWidth; h = c.clientHeight = window.innerHeight;
    c.width = Math.round(w*dpr); c.height = Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
  } reset(); addEventListener('resize', reset);
  function tick(){
    const imgData = ctx.createImageData(w, h);
    for (let i=0; i<imgData.data.length; i+=4){
      const v = (Math.random()*255)|0;
      imgData.data[i]=v; imgData.data[i+1]=v; imgData.data[i+2]=v; imgData.data[i+3]=18;
    }
    ctx.putImageData(imgData, 0, 0);
    requestAnimationFrame(tick);
  } tick();
})();

// Starfield behind everything
(function starfield(){
  const cvs = document.createElement('canvas');
  cvs.id = 'stars'; document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d'); let w,h,DPR= Math.max(1, devicePixelRatio||1), stars=[];
  function resize(){ w=cvs.clientWidth=innerWidth; h=cvs.clientHeight=innerHeight; cvs.width=Math.round(w*DPR); cvs.height=Math.round(h*DPR); ctx.setTransform(DPR,0,0,DPR,0,0);
    stars = Array.from({length:160},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.6+.2,a:Math.random(),s:Math.random()*.6+.2}));
  } resize(); addEventListener('resize', resize);
  function tick(){ ctx.clearRect(0,0,w,h); for(const st of stars){ st.a+=0.02*st.s; const alpha=.2+Math.abs(Math.sin(st.a))*.6;
    ctx.beginPath(); ctx.arc(st.x,st.y,st.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${alpha})`; ctx.fill(); } requestAnimationFrame(tick); } tick();
})();

// Vinyl tilt 3D
(function tilt(){
  const wrap = document.querySelector('.vinyl-wrap'); if (!wrap) return;
  const card = wrap;
  function handle(e){
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    card.style.transform = `rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(x*10).toFixed(2)}deg)`;
  }
  card.addEventListener('mousemove', handle);
  card.addEventListener('mouseleave', ()=> card.style.transform='');
})();

// Tracks audio: tiny EQ using WebAudio Analyser + fallback CSS bars
document.querySelectorAll('.track').forEach(card => {
  const src = card.getAttribute('data-audio');
  const eq = document.createElement('div'); eq.className='eq';
  for (let i=0;i<6;i++){ const b=document.createElement('span'); b.style.height = (6+Math.random()*12)+'px'; eq.appendChild(b); }
  card.appendChild(eq);
  let ctx, analyser, data, source, audio;
  function setup(){
    if (ctx) return;
    audio = new Audio(src); audio.crossOrigin='anonymous'; audio.loop=false; audio.preload='none';
    try{
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      analyser = ctx.createAnalyser(); analyser.fftSize=64;
      data = new Uint8Array(analyser.frequencyBinCount);
      source = ctx.createMediaElementSource(audio); source.connect(analyser); analyser.connect(ctx.destination);
      render();
    }catch(err){ /* fallback will use CSS random heights */ }
  }
  function render(){
    if (!analyser) return;
    analyser.getByteFrequencyData(data);
    const bars = eq.querySelectorAll('span');
    for(let i=0;i<bars.length;i++){
      const v = data[i%data.length]/255;
      bars[i].style.height = (4 + v*18) + 'px';
    }
    requestAnimationFrame(render);
  }
  let playing=false;
  card.addEventListener('mouseenter', async ()=>{
    setup(); if (audio){ audio.currentTime=0; try{ await audio.play(); playing=true; }catch(e){} }
  });
  card.addEventListener('mouseleave', ()=>{ if (playing && audio){ audio.pause(); playing=false; } });
});

// Lightbox
(function(){
  const lb = document.getElementById('lightbox');
  const img = lb.querySelector('img');
  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.getAttribute('data-lightbox');
      lb.classList.add('open');
    });
  });
  function close(){ lb.classList.remove('open'); }
  lb.addEventListener('click', close);
  window.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
})();

// Marquee dub row duplication
(function(){
  const row = document.querySelector('.marquee .row'); if (!row) return;
  row.innerHTML = row.innerHTML + row.innerHTML; // duplicate for seamless loop
})();

// Custom cursor
(function(){
  const dot = document.createElement('div');
  Object.assign(dot.style, { position:'fixed', width:'8px', height:'8px', borderRadius:'50%', background:'rgba(255,255,255,.85)',
    boxShadow:'0 0 14px rgba(0,209,255,.55)', pointerEvents:'none', zIndex:4000, transform:'translate(-50%,-50%)'});
  document.body.appendChild(dot);
  window.addEventListener('mousemove', e => { dot.style.left = e.clientX+'px'; dot.style.top = e.clientY+'px'; });
})();