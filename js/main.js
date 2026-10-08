
(function(){
  "use strict";
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  if(!hasST){ document.documentElement.classList.add("no-gsap"); }

  /* ---------- preloader ---------- */
  var pre = document.getElementById("pre"),
      pnum = document.getElementById("pnum"),
      pbar = document.getElementById("pbar"),
      val = 0, finished = false;

  function finish(){
    if(finished) return; finished = true;
    pnum.textContent = "100"; pbar.style.width = "100%";
    setTimeout(function(){
      pre.classList.add("done");
      document.body.classList.remove("locked");
      setTimeout(function(){ pre.style.display = "none"; startHero(); }, 950);
    }, 350);
  }
  document.body.classList.add("locked");
  var tick = setInterval(function(){
    val += Math.random() * 13 + 4;
    if(val >= 100){ val = 100; clearInterval(tick); finish(); }
    pnum.textContent = Math.floor(val);
    pbar.style.width = val + "%";
  }, 90);
  setTimeout(function(){ clearInterval(tick); finish(); }, 3200); // hard fallback
  window.addEventListener("load", function(){ setTimeout(function(){ clearInterval(tick); finish(); }, 400); });

  /* ---------- cursor ---------- */
  var cur = document.getElementById("cur"), dot = document.getElementById("curDot"),
      mx=0,my=0,cx=0,cy=0;
  window.addEventListener("mousemove", function(e){
    mx = e.clientX; my = e.clientY;
    dot.style.transform = "translate(" + (mx-3) + "px," + (my-3) + "px)";
  });
  (function loop(){
    cx += (mx-cx)*.16; cy += (my-cy)*.16;
    cur.style.transform = "translate(" + (cx-22) + "px," + (cy-22) + "px)";
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll("a,button,[data-hot],.pcard,.gal figure").forEach(function(el){
    el.addEventListener("mouseenter", function(){ cur.classList.add("hot"); });
    el.addEventListener("mouseleave", function(){ cur.classList.remove("hot"); });
  });

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll(){ nav.classList.toggle("stick", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  var burger = document.getElementById("burger"), fmenu = document.getElementById("fmenu");
  burger.addEventListener("click", function(){
    var open = fmenu.classList.toggle("open");
    burger.classList.toggle("x", open);
    document.body.classList.toggle("locked", open);
    if(open){
      fmenu.querySelectorAll("a.big").forEach(function(a,i){ a.style.transitionDelay = (0.18 + i*0.07) + "s"; });
    }else{
      fmenu.querySelectorAll("a.big").forEach(function(a){ a.style.transitionDelay = "0s"; });
    }
  });
  fmenu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){
      fmenu.classList.remove("open"); burger.classList.remove("x");
      document.body.classList.remove("locked");
    });
  });

  /* ---------- counters ---------- */
  function runCounter(el, delay){
    if(!hasGSAP){
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      return;
    }
    var end = parseFloat(el.getAttribute("data-count")),
        sfx = el.getAttribute("data-suffix") || "",
        obj = {v:0};
    gsap.to(obj, {v:end, duration:1.8, delay:delay||0, ease:"power2.out",
      onUpdate:function(){ el.textContent = Math.round(obj.v) + sfx; }});
  }

  /* ---------- hero intro (line based — keeps Arabic letters connected) ---------- */
  function startHero(){
    if(!hasGSAP) return;
    var lines = document.querySelectorAll("#heroTitle .ln i");
    if(lines.length){
      gsap.set(lines, {yPercent:115});
      gsap.to(lines, {yPercent:0, duration:1.15, ease:"power4.out", stagger:.12});
    }
    gsap.fromTo(".hero [data-rv]", {opacity:0, y:40},
      {opacity:1, y:0, duration:1, ease:"power3.out", stagger:.12, delay:.35});
    gsap.fromTo(".hero-float figure", {opacity:0, y:80, scale:.9},
      {opacity:1, y:0, scale:1, duration:1.2, ease:"power3.out", stagger:.15, delay:.5});
    document.querySelectorAll(".hero [data-count]").forEach(function(el, i){
      runCounter(el, .6 + i*.15);
    });
  }

  /* ---------- scroll reveals / parallax / counters ---------- */
  if(hasST){
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll("[data-rv]").forEach(function(el){
      if(el.closest(".hero")) return;
      var mode = el.getAttribute("data-rv");
      var to = {opacity:1, duration:1, ease:"power3.out",
        scrollTrigger:{trigger:el, start:"top 88%", once:true}};
      if(mode === "up"){ to.y = 0; }
      if(mode === "clip"){ to.clipPath = "inset(0 0 0% 0)"; }
      gsap.fromTo(el, mode === "clip" ? {clipPath:"inset(0 0 100% 0)", opacity:1} :
        {opacity:0, y: mode === "up" ? 60 : 0}, to);
    });

    /* hero bg parallax */
    gsap.to("#heroImg", {yPercent:-16, ease:"none",
      scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});

    /* floating cards mouse parallax */
    document.querySelectorAll("[data-float]").forEach(function(el){
      var s = parseFloat(el.getAttribute("data-float"));
      window.addEventListener("mousemove", function(e){
        var dx = (e.clientX / window.innerWidth - .5) * 30 * s,
            dy = (e.clientY / window.innerHeight - .5) * 26 * s;
        gsap.to(el, {x:dx, y:dy, duration:1, ease:"power3.out"});
      });
    });

    /* collage parallax */
    gsap.fromTo(".collage .big img", {yPercent:6}, {yPercent:-6, ease:"none",
      scrollTrigger:{trigger:".collage", start:"top bottom", end:"bottom top", scrub:true}});

    /* counters (outside hero — hero counters run in startHero) */
    document.querySelectorAll("[data-count]").forEach(function(el){
      if(el.closest(".hero")) return;
      ScrollTrigger.create({
        trigger: el, start:"top 88%", once:true,
        onEnter: function(){ runCounter(el); }
      });
    });

    /* footer outline text drift */
    gsap.fromTo(".foot-big", {letterSpacing:"0.06em", opacity:.4},
      {letterSpacing:"-0.02em", opacity:1, ease:"none",
       scrollTrigger:{trigger:".foot", start:"top bottom", end:"top 40%", scrub:true}});
  } else {
    document.querySelectorAll("[data-count]").forEach(function(el){
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
    document.querySelectorAll("[data-rv]").forEach(function(el){ el.style.opacity = 1; });
    document.querySelectorAll(".hero-float figure").forEach(function(el){ el.style.opacity = 1; });
  }

  /* ---------- tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function(t){
    t.addEventListener("click", function(){
      tabs.forEach(function(x){ x.classList.remove("on"); });
      t.classList.add("on");
      var id = t.getAttribute("data-tab");
      document.querySelectorAll(".panel").forEach(function(p){ p.classList.remove("on"); });
      var panel = document.getElementById(id);
      panel.classList.add("on");
      if(hasGSAP){
        gsap.fromTo(panel, {opacity:0, y:36}, {opacity:1, y:0, duration:.7, ease:"power3.out"});
        gsap.fromTo(panel.querySelectorAll(".pcard"), {opacity:0, y:50, scale:.97},
          {opacity:1, y:0, scale:1, duration:.8, ease:"power3.out", stagger:.1, delay:.12});
        if(hasST){ ScrollTrigger.refresh(); }
      }
    });
  });

  /* ---------- map: show fallback if offline ---------- */
  var mapIf = document.querySelector(".mapbox iframe"), mapLoaded = false;
  if(mapIf){
    mapIf.addEventListener("load", function(){ mapLoaded = true; });
    setTimeout(function(){ if(!mapLoaded){ mapIf.style.display = "none"; } }, 6000);
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lb"), lbImg = lb.querySelector("img");
  document.querySelectorAll("[data-lb]").forEach(function(f){
    f.addEventListener("click", function(){
      lbImg.src = f.querySelector("img").src;
      lb.classList.add("on");
      document.body.classList.add("locked");
    });
  });
  function closeLb(){ lb.classList.remove("on"); document.body.classList.remove("locked"); }
  document.getElementById("lbx").addEventListener("click", closeLb);
  lb.addEventListener("click", function(e){ if(e.target === lb) closeLb(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeLb(); });

  /* ---------- contact form (opens mail client — no backend needed) ---------- */
  var form = document.getElementById("cform");
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var d = new FormData(form);
      var body = "الاسم: " + (d.get("name")||"") +
                 "\nالجوال: " + (d.get("phone")||"") +
                 "\nالبريد: " + (d.get("email")||"") +
                 "\n\n" + (d.get("msg")||"");
      window.location.href = "mailto:sales@alwady-alakhdar.com?subject=" +
        encodeURIComponent("استفسار من الموقع - " + (d.get("name")||"")) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();