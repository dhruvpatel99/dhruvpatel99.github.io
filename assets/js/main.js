/* Dhruv Patel – portfolio behaviour (no libraries).
   - status icons
   - career.yml run console (play + re-run)
   - pipeline navigation that follows the scroll
   - scroll reveals and project pipeline strips
   - tech stack filters
   - agent log in the hero (works with or without the 3D robot) */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = getComputedStyle(document.documentElement);
  function cssVar(name) { return root.getPropertyValue(name).trim(); }

  /* ---------- Status icons ---------- */
  function icon(kind, c) {
    if (kind === "pass") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="' + c.pass + '"/><path d="M6 10.3l2.7 2.7L14.2 7.6" stroke="#06140D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if (kind === "run") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" stroke="' + c.track + '" stroke-width="2.4" fill="none"/><path d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5" stroke="' + c.run + '" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';
    }
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" stroke="' + c.queued + '" stroke-width="2" fill="none" stroke-dasharray="3 3"/></svg>';
  }
  var colors = { pass: cssVar("--pass"), run: cssVar("--run"), track: "rgba(245,181,68,.25)", queued: cssVar("--con-dim") };
  function setIcon(el, kind) {
    el.innerHTML = icon(kind, colors);
    el.classList.toggle("spin", kind === "run");
  }
  document.querySelectorAll("[data-icon]").forEach(function (el) { setIcon(el, el.getAttribute("data-icon")); });

  /* ---------- Career run console ---------- */
  var JOBS = [
    { id: "checkout-education", when: "2018–2025", lines: [
      ["cmd", "Run actions/checkout@education"],
      ["ok",  "Diploma, Computer Engineering", "VPMP Polytechnic, 2018–2022"],
      ["ok",  "B.Tech, Cybersecurity", "Silver Oak University, 2022–2025"]
    ]},
    { id: "security-testing", when: "Jan–Apr 2025", lines: [
      ["cmd", "Run pentest --standard owasp-top-10"],
      ["ok",  "Penetration Testing Intern", "Alicorn Solutions"],
      ["ok",  "Vulnerability reports delivered with fixes"]
    ]},
    { id: "build-at-naapbooks", when: "Jul 2025 – now", lines: [
      ["cmd", "Run support-engineer --company naapbooks"],
      ["ok",  "CI/CD pipelines for 14+ applications"],
      ["ok",  "IIS deploys: VizMan, InsiderQ, eNotary"],
      ["ok",  "Jenkins deploys to an Ubuntu server with 7 domains"],
      ["ok",  "Monitoring with Prometheus, Grafana and Loki"]
    ]},
    { id: "migrate-to-k3s", when: "running", keepRunning: true, lines: [
      ["cmd", "Run migrate --from docker --to k3s"],
      ["wip", "Moving 25 containers for 3 products to k3s"]
    ]}
  ];

  var runEl = document.querySelector(".run");
  if (runEl) {
    var jobsEl = document.getElementById("jobs");
    var logEl = document.getElementById("log");
    var ghost = document.getElementById("logGhost");
    var chip = document.getElementById("runChip");
    var timerEl = document.getElementById("runTimer");
    var runIcon = document.getElementById("runIcon");
    var lineNo = 0, runToken = 0, timerId = null, started = false;

    var jobEls = JOBS.map(function (job) {
      var li = document.createElement("li");
      li.className = "job queued";
      li.innerHTML = '<span class="si"></span><span class="jn"></span><span class="jd"></span>';
      li.querySelector(".jn").textContent = job.id;
      li.querySelector(".jd").textContent = job.when;
      jobsEl.appendChild(li);
      return li;
    });

    var addLine = function (kind, text, extra, target) {
      target = target || logEl;
      var n = target === logEl ? (lineNo += 1) : target.childElementCount + 1;
      var row = document.createElement("div");
      row.className = "ln";
      var no = document.createElement("span");
      no.className = "no"; no.textContent = n;
      var body = document.createElement("span");
      if (kind === "grp") { body.className = "grp"; body.textContent = "▸ " + text; }
      else if (kind === "cmd") { body.className = "cmd"; body.textContent = "$ " + text; }
      else {
        body.className = kind;
        var mark = document.createElement("b");
        mark.textContent = kind === "ok" ? "✓ " : "● ";
        body.appendChild(mark);
        body.appendChild(document.createTextNode(text));
        if (extra) {
          var d = document.createElement("span");
          d.className = "sub"; d.textContent = extra;
          body.appendChild(d);
        }
      }
      row.appendChild(no); row.appendChild(body);
      target.appendChild(row);
      return body;
    };

    // Invisible full copy keeps the console at its final height from the start.
    JOBS.forEach(function (job) {
      addLine("grp", job.id, null, ghost);
      job.lines.forEach(function (l) { addLine(l[0], l[1], l[2], ghost); });
    });

    var setJob = function (i, state) {
      var li = jobEls[i];
      li.className = "job " + state + (state === "running" ? " active" : "");
      setIcon(li.querySelector(".si"), state === "done" ? "pass" : state === "running" ? "run" : "queued");
    };
    var setRun = function (state) {
      chip.className = "chip " + state;
      chip.textContent = state === "queued" ? "Queued" : state === "running" ? "In progress" : "Success";
      setIcon(runIcon, state === "queued" ? "queued" : state === "running" ? "run" : "pass");
    };
    var fmt = function (sec) { return sec < 60 ? sec + "s" : Math.floor(sec / 60) + "m " + (sec % 60) + "s"; };
    var startTimer = function () {
      clearInterval(timerId);
      var start = Date.now();
      timerEl.textContent = "0s";
      timerId = setInterval(function () { timerEl.textContent = fmt(Math.floor((Date.now() - start) / 1000)); }, 1000);
    };
    var sleep = function (ms, token) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () { token === runToken ? resolve() : reject("cancelled"); }, ms);
      });
    };
    var reset = function () {
      logEl.innerHTML = ""; lineNo = 0;
      JOBS.forEach(function (_, i) { setJob(i, "queued"); });
      setRun("queued");
      timerEl.textContent = "0s";
    };
    var renderInstant = function () {
      reset();
      setRun("running");
      JOBS.forEach(function (job, i) {
        addLine("grp", job.id);
        job.lines.forEach(function (l) { addLine(l[0], l[1], l[2]); });
        setJob(i, job.keepRunning ? "running" : "done");
      });
      timerEl.textContent = "since 2018";
    };
    var play = async function () {
      var token = ++runToken;
      reset();
      try {
        await sleep(500, token);
        setRun("running");
        startTimer();
        for (var i = 0; i < JOBS.length; i++) {
          var job = JOBS[i];
          setJob(i, "running");
          addLine("grp", job.id);
          await sleep(360, token);
          for (var j = 0; j < job.lines.length; j++) {
            var l = job.lines[j];
            addLine(l[0], l[1], l[2]);
            await sleep(l[0] === "cmd" ? 480 : 340, token);
          }
          if (!job.keepRunning) { setJob(i, "done"); await sleep(240, token); }
        }
        var last = logEl.lastChild && logEl.lastChild.lastChild;
        if (last) { var c = document.createElement("span"); c.className = "cursor"; last.appendChild(c); }
      } catch (e) { /* a newer run replaced this one */ }
    };

    reset();
    document.getElementById("rerun").addEventListener("click", function () {
      clearInterval(timerId);
      if (reduce) renderInstant(); else play();
    });

    // Start the run when the console scrolls into view.
    var startRun = function () {
      if (started) return;
      started = true;
      if (reduce) renderInstant(); else play();
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { startRun(); obs.disconnect(); }
      }, { threshold: 0.3 }).observe(runEl);
    } else { startRun(); }
  }

  /* ---------- Pipeline nav follows the scroll ---------- */
  var navItems = Array.prototype.slice.call(document.querySelectorAll("#stagesNav li"));
  var sections = navItems.map(function (li) { return document.getElementById(li.getAttribute("data-sec")); });
  function updateNav() {
    var mark = window.scrollY + window.innerHeight * 0.35;
    var current = -1;
    sections.forEach(function (sec, i) { if (sec && sec.offsetTop <= mark) current = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.length - 1;
    navItems.forEach(function (li, i) {
      li.classList.toggle("passed", i < current);
      li.classList.toggle("current", i === current);
      var a = li.querySelector("a");
      if (i === current) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);
  updateNav();

  /* ---------- Scroll reveals + project pipelines ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  var pipes = document.querySelectorAll(".pipe");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    pipes.forEach(function (el) { el.classList.add("lit"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains("pipe") ? "lit" : "in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    pipes.forEach(function (el) { io.observe(el); });
    // A fast jump (anchor link, Page Down) can skip past an element in one frame.
    // Anything above the bottom of the screen is shown straight away.
    var catchUp = function () {
      document.querySelectorAll("[data-reveal]:not(.in), .pipe:not(.lit)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add(el.classList.contains("pipe") ? "lit" : "in");
          io.unobserve(el);
        }
      });
    };
    var catchTimer = null;
    window.addEventListener("scroll", function () {
      clearTimeout(catchTimer);
      catchTimer = setTimeout(catchUp, 120);
    }, { passive: true });
    window.addEventListener("hashchange", catchUp);
  }

  /* Soft light that follows the pointer on project cards */
  document.querySelectorAll(".proj").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Tech stack filters ---------- */
  var filterBtns = document.querySelectorAll(".filter");
  var tools = document.querySelectorAll("#stackGrid .tool");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      tools.forEach(function (t) { t.classList.toggle("hide", f !== "all" && t.getAttribute("data-cat") !== f); });
    });
  });

  /* ---------- Agent log in the hero ---------- */
  var AGENT_LINES = [
    ["deploy --target iis", "VizMan, InsiderQ and eNotary on IIS"],
    ["pipelines status", "14+ apps on CI/CD, 4 in production"],
    ["./health-check.ps1", "runs before every go-live"],
    ["kubectl get nodes", "moving 25 containers to k3s"],
    ["open grafana", "Prometheus metrics + Loki logs"]
  ];
  var logBox = document.getElementById("agentLog");
  var stage = document.getElementById("agentStage");
  var agentIndex = 0, typeTimer = null, cycleTimer = null;

  function showAgentLine(i, instant) {
    if (!logBox) return;
    clearInterval(typeTimer);
    var cmd = AGENT_LINES[i][0], out = AGENT_LINES[i][1];
    logBox.innerHTML = '<span class="k">ops-agent $ </span><span class="cmd"></span><span class="caret"></span><span class="out"></span>';
    var cmdEl = logBox.querySelector(".cmd"), outEl = logBox.querySelector(".out"), caret = logBox.querySelector(".caret");
    function finish() {
      cmdEl.textContent = cmd;
      caret.remove();
      outEl.innerHTML = "<b>✓</b> ";
      outEl.appendChild(document.createTextNode(out));
    }
    if (instant) { finish(); return; }
    var n = 0;
    typeTimer = setInterval(function () {
      n += 1;
      cmdEl.textContent = cmd.slice(0, n);
      if (n >= cmd.length) { clearInterval(typeTimer); setTimeout(finish, 220); }
    }, 38);
  }
  function nextAgentLine() {
    agentIndex = (agentIndex + 1) % AGENT_LINES.length;
    showAgentLine(agentIndex, reduce);
  }
  function scheduleCycle() {
    clearInterval(cycleTimer);
    if (!reduce) cycleTimer = setInterval(nextAgentLine, 4200);
  }
  if (logBox) {
    showAgentLine(0, reduce);
    scheduleCycle();
    stage.addEventListener("click", function () {
      nextAgentLine();
      scheduleCycle();
      stage.dispatchEvent(new CustomEvent("agent:poke"));
    });
    stage.setAttribute("tabindex", "0");
    stage.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stage.click(); }
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearInterval(cycleTimer); else scheduleCycle();
    });
  }
})();
