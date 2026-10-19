/* =============================================================
   IP Engineering Pro — Version 2  interactions
   Vanilla JS, no dependencies.
   ============================================================= */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");
  var preCount = document.getElementById("preCount");
  function runPreloader() {
    if (!preloader) return;
    if (reduceMotion) { preloader.classList.add("is-done"); return; }
    var n = 0;
    var t = setInterval(function () {
      n += Math.floor(Math.random() * 12) + 4;
      if (n >= 100) { n = 100; clearInterval(t); setTimeout(function () { preloader.classList.add("is-done"); }, 350); }
      if (preCount) preCount.textContent = n;
    }, 90);
  }
  window.addEventListener("load", runPreloader);
  // Fallback in case load already fired
  setTimeout(function () { if (preloader && !preloader.classList.contains("is-done") && document.readyState === "complete") runPreloader(); }, 1200);

  /* ---------- Scroll progress ---------- */
  var progressBar = document.querySelector(".scroll-progress span");
  function onScrollProgress() {
    var h = document.documentElement;
    var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (progressBar) progressBar.style.width = (scrolled * 100) + "%";
  }

  /* ---------- Header: solid + hide on scroll ---------- */
  var header = document.getElementById("header");
  var lastY = 0;
  function onHeader() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-solid", y > 80);
      if (y > lastY && y > 400) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");
    }
    lastY = y;
  }

  /* ---------- Journey scroll film ---------- */
  var jSection = document.getElementById("journey");
  var jLayers = jSection ? jSection.querySelectorAll(".jlayer") : [];
  var jPanels = jSection ? jSection.querySelectorAll(".jpanel") : [];
  var jNum = document.getElementById("journeyStepNum");
  var jMeter = document.getElementById("journeyMeter");
  var jSteps = jPanels.length || 1;
  var jLastIdx = -1;
  function onJourney() {
    if (!jSection) return;
    var rect = jSection.getBoundingClientRect();
    var scrollable = jSection.offsetHeight - window.innerHeight;
    var p = scrollable > 0 ? (-rect.top) / scrollable : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    if (jMeter) jMeter.style.width = (p * 100) + "%";
    var idx = Math.floor(p * jSteps);
    if (idx > jSteps - 1) idx = jSteps - 1;
    if (idx < 0) idx = 0;
    if (idx !== jLastIdx) {
      jLastIdx = idx;
      if (jNum) jNum.textContent = ("0" + (idx + 1)).slice(-2);
      for (var a = 0; a < jPanels.length; a++) {
        jPanels[a].classList.toggle("is-active", a === idx);
      }
      for (var b = 0; b < jLayers.length; b++) {
        var li = parseInt(jLayers[b].getAttribute("data-i"), 10);
        jLayers[b].classList.toggle("is-built", li <= idx);
        jLayers[b].classList.toggle("is-active", li === idx);
      }
    }
  }

  /* ---------- Combined scroll handler (rAF throttled) ---------- */
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScrollProgress();
        onHeader();
        onParallax();
        onJourney();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger, .hero__title .line");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  var statNums = document.querySelectorAll(".stat__num");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var dur = 1800, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { cio.observe(el); });
  } else {
    statNums.forEach(function (el) {
      var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = parseFloat(el.getAttribute("data-count")).toFixed(d) + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Parallax ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  function onParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
      var img = el.querySelector("img");
      if (img) img.style.transform = "scale(1.1) translateY(" + offset.toFixed(1) + "px)";
    });
  }

  /* ---------- Menu overlay ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var menuOverlay = document.getElementById("menuOverlay");
  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("is-open");
    menuOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", function () {
      var open = menuOverlay.classList.toggle("is-open");
      menuOverlay.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menuOverlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }
    });
  });

  /* ---------- Custom cursor ---------- */
  if (!isTouch) {
    var cursor = document.querySelector(".cursor");
    var ring = document.querySelector(".cursor-ring");
    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (cursor) { cursor.style.left = mx + "px"; cursor.style.top = my + "px"; }
    });
    function ringLoop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      var type = el.getAttribute("data-cursor");
      el.addEventListener("mouseenter", function () {
        document.body.classList.add("cursor-hover");
        if (type === "view") document.body.classList.add("cursor-view");
      });
      el.addEventListener("mouseleave", function () {
        document.body.classList.remove("cursor-hover");
        document.body.classList.remove("cursor-view");
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = 0.35;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * strength;
        var y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Hero dotted-Earth globe ---------- */
  (function globe() {
    var canvas = document.getElementById("globe");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var animate = !reduceMotion;
    var ORANGE = "235,135,50";

    var W, H, cx, cy, R;
    var land = [];        // {x,y,z} land dots
    var countries = [];   // {name,x,y,z}
    var arcs = [];        // {j, p} connections from hub
    var hubIndex = -1;

    var rot = 0.0;        // longitude rotation
    var tilt = 0.32;      // latitude tilt
    var velRot = 0, velTilt = 0;
    var autoSpeed = -0.0012;
    var dragging = false, lastX = 0, lastY = 0;

    function latLonToVec(lat, lon) {
      var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
      return {
        x: Math.cos(la) * Math.sin(lo),
        y: Math.sin(la),
        z: Math.cos(la) * Math.cos(lo)
      };
    }

    function buildData() {
      land = [];
      var L = window.GLOBE_LAND || [];
      // Thin out dots on small screens for performance.
      var skip = W < 820 ? 2 : 1;
      for (var i = 0; i < L.length; i += 2 * skip) {
        land.push(latLonToVec(L[i + 1], L[i]));
      }
      countries = [];
      var C = window.GLOBE_COUNTRIES || [];
      for (var c = 0; c < C.length; c++) {
        var v = latLonToVec(C[c].lat, C[c].lon);
        v.name = C[c].name;
        countries.push(v);
        if (C[c].name === "Lebanon") hubIndex = c;
      }
      // Network arcs radiate from the hub (Lebanon) to a rotating set of partners.
      arcs = [];
      if (hubIndex >= 0) {
        for (var a = 0; a < countries.length; a++) {
          if (a === hubIndex) continue;
          arcs.push({ j: a, p: Math.random() });
        }
      }
    }

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var small = W < 820;
      cx = W * (small ? 0.5 : 0.66);
      cy = H * (small ? 0.64 : 0.5);
      R = Math.min(W, H) * (small ? 0.44 : 0.52);
    }

    function project(p) {
      var cosY = Math.cos(rot), sinY = Math.sin(rot);
      var x1 = p.x * cosY - p.z * sinY;
      var z1 = p.x * sinY + p.z * cosY;
      var cosX = Math.cos(tilt), sinX = Math.sin(tilt);
      var y1 = p.y * cosX - z1 * sinX;
      var z2 = p.y * sinX + z1 * cosX;
      return { x: cx + x1 * R, y: cy - y1 * R, z: z2 };
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      // --- atmosphere glow around the sphere ---
      var halo = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.3);
      halo.addColorStop(0, "rgba(70,120,180,0.0)");
      halo.addColorStop(0.55, "rgba(70,120,180,0.18)");
      halo.addColorStop(1, "rgba(10,12,16,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2); ctx.fill();

      // --- solid globe body (occludes the far side) ---
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      var body = ctx.createLinearGradient(0, cy - R, 0, cy + R);
      body.addColorStop(0, "#0a0f16");
      body.addColorStop(0.62, "#0a0f16");
      body.addColorStop(1, "#153353");
      ctx.fillStyle = body;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      // --- land dots (front hemisphere only) ---
      for (var i = 0; i < land.length; i++) {
        var pr = project(land[i]);
        if (pr.z <= 0) continue;              // hidden behind the globe
        var depth = pr.z;                      // 0 at limb .. 1 at center
        var dx = pr.x - cx, dy = pr.y - cy;
        var rr = Math.sqrt(dx * dx + dy * dy) / R; // 0 center .. 1 limb
        var alpha = (0.18 + depth * 0.72).toFixed(2);
        var size = 0.7 + depth * 0.9;
        var col = "255,255,255";
        if (rr > 0.78) {
          // rim atmosphere: warm at the top, cool at the bottom
          var k = Math.min(1, (rr - 0.78) / 0.22);
          if (dy < -R * 0.1) col = mix("255,255,255", ORANGE, k * 0.9);
          else if (dy > R * 0.15) col = mix("255,255,255", "90,150,210", k * 0.9);
        }
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + col + "," + alpha + ")";
        ctx.arc(pr.x, pr.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- bright rim arcs (sun-lit top, cool bottom) ---
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(" + ORANGE + ",0.55)";
      ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI * 0.98, -Math.PI * 0.30); ctx.stroke();
      ctx.strokeStyle = "rgba(90,150,210,0.4)";
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 0.18, Math.PI * 0.72); ctx.stroke();

      // --- network arcs from the hub ---
      var hub = hubIndex >= 0 ? project(countries[hubIndex]) : null;
      if (hub && hub.z > -0.1) {
        for (var a = 0; a < arcs.length; a++) {
          var arc = arcs[a];
          var tp = project(countries[arc.j]);
          if (tp.z < -0.1) continue;
          var mxp = (hub.x + tp.x) / 2 + (hub.y - tp.y) * 0.2;
          var myp = (hub.y + tp.y) / 2 - (hub.x - tp.x) * 0.2 - R * 0.16;
          ctx.strokeStyle = "rgba(" + ORANGE + ",0.28)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hub.x, hub.y);
          ctx.quadraticCurveTo(mxp, myp, tp.x, tp.y);
          ctx.stroke();
          if (animate) {
            arc.p += 0.004;
            if (arc.p > 1) arc.p = 0;
          }
          var t = arc.p;
          var bx = (1 - t) * (1 - t) * hub.x + 2 * (1 - t) * t * mxp + t * t * tp.x;
          var by = (1 - t) * (1 - t) * hub.y + 2 * (1 - t) * t * myp + t * t * tp.y;
          ctx.beginPath();
          ctx.fillStyle = "rgba(" + ORANGE + ",0.95)";
          ctx.arc(bx, by, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- country markers + labels (front hemisphere) ---
      var front = [];
      for (var m = 0; m < countries.length; m++) {
        var cp = project(countries[m]);
        if (cp.z <= 0.02) continue;
        front.push({ name: countries[m].name, pr: cp, depth: cp.z });
      }
      front.sort(function (p, q) { return q.depth - p.depth; });

      // markers
      for (var f = 0; f < front.length; f++) {
        var P = front[f].pr;
        var ga = (0.5 + front[f].depth * 0.5).toFixed(2);
        var glow = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, 9);
        glow.addColorStop(0, "rgba(" + ORANGE + "," + ga + ")");
        glow.addColorStop(1, "rgba(" + ORANGE + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(P.x, P.y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(" + ORANGE + ",1)";
        ctx.beginPath(); ctx.arc(P.x, P.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,240,225,0.95)";
        ctx.beginPath(); ctx.arc(P.x, P.y, 1.1, 0, Math.PI * 2); ctx.fill();
      }

      // labels with simple collision avoidance
      ctx.font = "600 11px 'Space Grotesk', 'Segoe UI', system-ui, sans-serif";
      ctx.textBaseline = "middle";
      var placed = [];
      for (var l = 0; l < front.length; l++) {
        var pt = front[l].pr;
        var label = front[l].name.toUpperCase();
        var tw = ctx.measureText(label).width;
        var padX = 7, boxW = tw + padX * 2, boxH = 18;
        var offsets = [
          [-boxW - 11, -boxH / 2], [11, -boxH / 2],
          [-boxW - 11, -boxH - 7], [11, 7],
          [-boxW / 2, -boxH - 11], [-boxW / 2, 13]
        ];
        var chosen = null;
        for (var o = 0; o < offsets.length; o++) {
          var bx2 = pt.x + offsets[o][0], by2 = pt.y + offsets[o][1];
          if (bx2 < 2 || by2 < 2 || bx2 + boxW > W - 2 || by2 + boxH > H - 2) continue;
          var hit = false;
          for (var r = 0; r < placed.length; r++) {
            var pl = placed[r];
            if (bx2 < pl.x + pl.w + 4 && bx2 + boxW + 4 > pl.x &&
                by2 < pl.y + pl.h + 4 && by2 + boxH + 4 > pl.y) { hit = true; break; }
          }
          if (!hit) { chosen = { x: bx2, y: by2, w: boxW, h: boxH }; break; }
        }
        if (!chosen) continue;
        placed.push(chosen);
        var a2 = Math.min(1, 0.55 + front[l].depth * 0.6);
        roundRect(chosen.x, chosen.y, boxW, boxH, 3);
        ctx.fillStyle = "rgba(9,12,17," + (0.82 * a2).toFixed(2) + ")";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(" + ORANGE + "," + (0.55 * a2).toFixed(2) + ")";
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255," + a2.toFixed(2) + ")";
        ctx.fillText(label, chosen.x + padX, chosen.y + boxH / 2 + 0.5);
      }
    }

    function mix(c1, c2, t) {
      var a = c1.split(","), b = c2.split(",");
      return Math.round(+a[0] + (+b[0] - +a[0]) * t) + "," +
             Math.round(+a[1] + (+b[1] - +a[1]) * t) + "," +
             Math.round(+a[2] + (+b[2] - +a[2]) * t);
    }

    function step() {
      if (!dragging) {
        rot += autoSpeed + velRot;
        tilt += velTilt;
        velRot *= 0.94; velTilt *= 0.9;
        if (tilt > 1.2) { tilt = 1.2; velTilt = 0; }
        if (tilt < -1.2) { tilt = -1.2; velTilt = 0; }
      }
      render();
      if (animate) requestAnimationFrame(step);
    }

    // --- pointer drag to rotate ---
    canvas.style.touchAction = "pan-y";
    function onDown(e) {
      var rect = canvas.getBoundingClientRect();
      var px = e.clientX - rect.left, py = e.clientY - rect.top;
      var dx = px - cx, dy = py - cy;
      if (Math.sqrt(dx * dx + dy * dy) > R * 1.05) return; // only grab on the globe
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      velRot = 0; velTilt = 0;
      canvas.style.cursor = "grabbing";
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      rot += dx * 0.006;
      tilt += dy * 0.006;
      if (tilt > 1.2) tilt = 1.2;
      if (tilt < -1.2) tilt = -1.2;
      velRot = dx * 0.006; velTilt = dy * 0.006;
      if (!animate) render();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "grab";
    }
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    resize(); buildData();
    window.addEventListener("resize", function () { resize(); buildData(); if (!animate) render(); });
    if (animate) requestAnimationFrame(step); else render();
  })();

  /* ---------- Service card tilt (subtle) ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll(".svc").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(800px) rotateX(" + (-py * 4).toFixed(2) + "deg) rotateY(" + (px * 4).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  // init scroll state
  onScroll();
})();
