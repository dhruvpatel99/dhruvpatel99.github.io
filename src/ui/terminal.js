/**
 * "Ask my terminal": a small fake shell with real answers.
 *  - Type commands (Tab completes, ↑/↓ walks the history) or use the chips.
 *  - `gh repo list` and `gh run list` fetch live data from the GitHub API.
 *  - The first time it scrolls into view it types a short demo by itself.
 * Output is plain text in an aria-live log, so screen readers hear the answers.
 */
const USER = 'dhruvpatel99';
const SITE_REPO = 'dhruvpatel99/dhruvpatel99.github.io';
const EMAIL = 'dhruv00987@gmail.com';

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const c = (cls, t) => `<span class="${cls}">${esc(t)}</span>`;
const link = (href, t) => `<a href="${href}" target="_blank" rel="noopener">${esc(t)}</a>`;

function ago(iso) {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [u, n] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v > 1 ? 's' : ''} ago`; }
  return 'just now';
}

const NEOFETCH = [
  ['    ____  ____ ', 'dhruv@ops'],
  ['   / __ \\/ __ \\', '---------'],
  ['  / / / / /_/ /', 'Role: Support Engineer (DevOps)'],
  [' / /_/ / ____/ ', 'Company: Naapbooks Limited'],
  ['/_____/_/      ', 'Location: Ahmedabad, India'],
  ['               ', 'Pipelines: 14+ apps, 4 in production'],
  ['               ', 'Containers: 25 managed, 6 on k3s'],
  ['               ', 'Monitoring: Prometheus, Grafana, Loki'],
  ['               ', 'Education: B.Tech, Cybersecurity'],
];

const SKILLS_YML = `ci_cd:        [GitHub Actions, Jenkins, self-hosted runners]
containers:   [Docker, Docker Compose, Kubernetes (k3s)]
iac:          [Terraform (learning), Ansible]
systems:      [Windows Server, IIS, Linux (Ubuntu), Nginx, Active Directory]
monitoring:   [Prometheus, Grafana, Loki, Promtail]
cloud:        [AWS Lambda, API Gateway, DynamoDB, S3, CloudFront, IAM]
scripting:    [PowerShell, Bash]
databases:    [MySQL, PostgreSQL]
security:     [OWASP Top 10, RBAC, secrets management]`;

const PROJECTS = [
  ['pass', 'iis-cicd', 'CI/CD + IIS deploys for 3 products', 'in production'],
  ['pass', 'cloudops-helpdesk', 'Serverless helpdesk on AWS', 'live'],
  ['run', 'docker-to-k3s', '6 of 25 containers on k3s', 'in progress'],
  ['pass', 'observability', 'Prometheus + Grafana + Loki', 'done'],
  ['run', 'zero-touch-platform', 'Push-to-deploy on AWS', 'building'],
  ['run', 'iac-lab', 'Terraform on Hyper-V', 'in progress'],
  ['pass', 'mysql-rbac', 'Role-based database access', 'done'],
  ['pass', 'owasp-scanner', 'B.Tech major project', 'done'],
];

export function initTerminal({ reduced }) {
  const root = document.getElementById('term');
  const out = document.getElementById('termOut');
  const form = document.getElementById('termForm');
  const input = document.getElementById('termIn');
  const body = document.getElementById('termBody');
  if (!root || !out || !form) return null;

  const history = [];
  let hIndex = 0;
  let busy = false;
  let touched = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

  const scroll = () => { body.scrollTop = body.scrollHeight; };
  function print(html, cls = '') {
    const line = document.createElement('div');
    line.className = `tl ${cls}`;
    line.innerHTML = html;
    out.appendChild(line);
    // Keep the log from growing forever.
    while (out.children.length > 160) out.firstChild.remove();
    scroll();
    return line;
  }
  const echo = (cmd) => print(`<span class="pu">dhruv@ops</span>:<span class="pp">~</span>$ ${esc(cmd)}`, 'cmdline');

  async function typeInto(cmd) {
    input.value = '';
    for (const ch of cmd) { input.value += ch; await wait(45 + Math.random() * 45); }
    await wait(220);
  }

  async function ghFetch(path) {
    const res = await fetch(`https://api.github.com/${path}`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
  }

  const COMMANDS = {
    help: {
      desc: 'list commands',
      run() {
        const rows = Object.entries(COMMANDS).filter(([, v]) => v.desc).map(([k, v]) => `  ${c('k', k.padEnd(18))}${esc(v.desc)}`);
        print(`Available commands:\n${rows.join('\n')}\n\n${c('dim', 'Tab completes · ↑/↓ history · Ctrl+L clears')}`);
      },
    },
    whoami: {
      desc: 'who is this?',
      run() { print(`Dhruv Patel. Support Engineer doing DevOps at Naapbooks Limited, Ahmedabad.\nI build CI/CD pipelines, run containers and keep production calm.`); },
    },
    neofetch: {
      desc: 'system info, me edition',
      run() {
        const lines = NEOFETCH.map(([art, info], i) => `${c('art', art)}  ${i === 0 ? c('pu', info) : i === 1 ? c('dim', info) : info.replace(/^([^:]+):/, (m, k) => `${c('k', k)}:`)}`);
        const bar = ['#3FD8F5', '#3DDC97', '#F5B544', '#FF5CCB', '#5B8CFF', '#E8EDF4'].map((col) => `<i style="background:${col}"></i>`).join('');
        print(`${lines.join('\n')}\n${' '.repeat(17)}<span class="swatch">${bar}</span>`);
      },
    },
    'cat skills.yml': { desc: 'what I work with', run() { print(esc(SKILLS_YML).replace(/^(\w+):/gm, (m, k) => `${c('k', k)}:`)); } },
    'ls projects': {
      desc: 'projects and their status',
      run() {
        const icon = { pass: c('ok', '✓'), run: c('warn', '●') };
        print(PROJECTS.map(([s, name, what, st]) => `${icon[s]} ${c('k', name.padEnd(21))}${esc(what.padEnd(38))}${c(s === 'pass' ? 'ok' : 'warn', st)}`).join('\n'));
        print(c('dim', 'Scroll up to ~/projects for the full cards.'));
      },
    },
    experience: {
      desc: 'where I have worked',
      run() {
        print(`${c('ok', '●')} ${c('k', 'Support Engineer')}, Naapbooks Limited   Jul 2025 – now
    CI/CD for 14+ apps · IIS + Ubuntu deploys · Docker → k3s · Grafana/Loki
${c('ok', '✓')} ${c('k', 'Penetration Testing Intern')}, Alicorn Solutions   Jan – Apr 2025
    Web app pentests against the OWASP Top 10`);
      },
    },
    'kubectl get pods': {
      desc: 'pods in the k3s cluster',
      run() {
        const rs = Math.random().toString(16).slice(2, 12);
        const rows = Array.from({ length: 6 }, () => {
          const id = Math.random().toString(36).slice(2, 7);
          return `${`enotary-${rs}-${id}`.padEnd(28)}${'1/1'.padEnd(8)}${c('ok', 'Running'.padEnd(10))}${'0'.padEnd(10)}3d`;
        });
        print(`${c('dim', 'NAME'.padEnd(28) + 'READY'.padEnd(8) + 'STATUS'.padEnd(10) + 'RESTARTS'.padEnd(10) + 'AGE')}\n${rows.join('\n')}`);
        print(c('dim', '6 pods moved from Docker so far; 19 containers still to go. (pod names are illustrative)'));
      },
    },
    'docker ps': {
      desc: 'containers on the staging server',
      run() { print(`${c('k', '25')} containers running for ${c('k', '3')} products on Ubuntu 22.04\n${c('dim', '6 of them now live on k3s; the rest are queued for migration.')}`); },
    },
    'gh repo list': {
      desc: 'my public repos (live from GitHub)',
      async run() {
        const line = print(c('dim', `fetching github.com/${USER} …`));
        try {
          const repos = await ghFetch(`users/${USER}/repos?sort=updated&per_page=8`);
          line.remove();
          if (!repos.length) { print('No public repositories yet.'); return; }
          print(repos.map((r) => `${link(r.html_url, r.name)}${' '.repeat(Math.max(2, 32 - r.name.length))}${c('dim', (r.language || '—').padEnd(12))}${c('dim', `updated ${ago(r.pushed_at)}`)}`).join('\n'));
        } catch (e) {
          line.innerHTML = `${c('err', 'error:')} could not reach GitHub (${esc(e.message)}). See ${link(`https://github.com/${USER}`, `github.com/${USER}`)}`;
        }
      },
    },
    'gh run list': {
      desc: "this site's latest deploys (live)",
      async run() {
        const line = print(c('dim', 'fetching workflow runs …'));
        try {
          const data = await ghFetch(`repos/${SITE_REPO}/actions/runs?per_page=5`);
          line.remove();
          print(data.workflow_runs.map((r) => {
            const ok = r.conclusion === 'success';
            const st = r.status !== 'completed' ? c('warn', '● running ') : ok ? c('ok', '✓ success ') : c('err', `✗ ${r.conclusion} `);
            return `${st} ${link(r.html_url, r.head_sha.slice(0, 7))}  ${esc((r.display_title || r.name).slice(0, 38).padEnd(40))}${c('dim', ago(r.updated_at))}`;
          }).join('\n') || 'No runs yet.');
        } catch (e) {
          line.innerHTML = `${c('err', 'error:')} could not reach GitHub (${esc(e.message)}).`;
        }
      },
    },
    './deploy.sh': {
      desc: 'watch a deployment',
      async run() {
        const steps = [
          ['checkout', 'git fetch origin main'],
          ['build', 'dotnet publish -c Release'],
          ['test', '42 passed, 0 failed'],
          ['deploy', 'rolling update 6/6, maxUnavailable=0'],
          ['health', 'GET /health → 200 OK (184 ms)'],
        ];
        for (const [name, detail] of steps) {
          const l = print(`${c('warn', '●')} ${c('k', name.padEnd(9))}${c('dim', detail)}`);
          await wait(520);
          l.innerHTML = `${c('ok', '✓')} ${c('k', name.padEnd(9))}${esc(detail)}`;
        }
        print(`${c('ok', 'deployment successful')} ${c('dim', '· zero downtime · total 2m 14s (simulated)')}`);
      },
    },
    'cat resume': {
      desc: 'download my CV',
      run() { print(`My CV: ${link('resume.pdf', 'resume.pdf')} ${c('dim', '(opens the PDF)')}`); },
    },
    contact: {
      desc: 'how to reach me',
      run() {
        print(`email     <a href="mailto:${EMAIL}">${EMAIL}</a>\ngithub    ${link(`https://github.com/${USER}`, `github.com/${USER}`)}\nlinkedin  ${link('https://www.linkedin.com/in/dhruv0911', 'linkedin.com/in/dhruv0911')}`);
      },
    },
    'sudo hire dhruv': {
      desc: '🙂',
      async run() {
        print('[sudo] password for recruiter: ********');
        await wait(500);
        print(`${c('ok', 'Permission granted.')} Next step: <a href="mailto:${EMAIL}?subject=Let's%20talk">email ${EMAIL}</a>`);
      },
    },
    uptime: { run() { print(`up since Jul 2025 · load average: CI/CD, support, k3s`); } },
    date: { run() { print(new Date().toString()); } },
    history: { run() { print(history.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join('\n') || 'empty'); } },
    clear: { desc: 'clear the screen', run() { out.innerHTML = ''; } },
  };
  // Friendly aliases.
  const ALIAS = {
    about: 'whoami', skills: 'cat skills.yml', projects: 'ls projects', ls: 'ls projects', pods: 'kubectl get pods',
    'kubectl get po': 'kubectl get pods', resume: 'cat resume', cv: 'cat resume', email: 'contact', 'gh repos': 'gh repo list',
    deploy: './deploy.sh', 'sh deploy.sh': './deploy.sh', 'bash deploy.sh': './deploy.sh', 'hire me': 'sudo hire dhruv', 'sudo hire me': 'sudo hire dhruv',
  };

  async function run(raw, { typed = false } = {}) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (busy) return;
    busy = true;
    if (typed) await typeInto(cmd);
    input.value = '';
    echo(cmd);
    if (cmd) { history.push(cmd); hIndex = history.length; }
    const key = ALIAS[cmd.toLowerCase()] || cmd.toLowerCase();
    try {
      if (!cmd) { /* empty line */ }
      else if (COMMANDS[key]) await COMMANDS[key].run();
      else if (/^rm -rf/.test(key)) print(`${c('err', 'denied:')} production is protected by RBAC. Nice try.`);
      else if (/^echo /.test(cmd)) print(esc(cmd.slice(5)));
      else if (/^open (github|linkedin)$/.test(key)) { const u = key.endsWith('github') ? `https://github.com/${USER}` : 'https://www.linkedin.com/in/dhruv0911'; window.open(u, '_blank', 'noopener'); print(`opening ${link(u, u)}`); }
      else if (key === 'exit' || key === 'logout') print('logout… just kidding. You can scroll on, though.');
      else if (key === 'sudo' || key.startsWith('sudo ')) print(`${c('err', 'dhruv is not in the sudoers file.')} This incident will be reported. 😉 Try ${c('k', 'sudo hire dhruv')}`);
      else print(`${c('err', 'command not found:')} ${esc(cmd)}. Type ${c('k', 'help')}.`);
    } finally {
      busy = false;
      scroll();
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); touched = true; run(input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hIndex > 0) input.value = history[--hIndex]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || ''; }
    else if (e.key === 'Tab' && input.value.trim()) {
      const v = input.value.toLowerCase();
      const hit = [...Object.keys(COMMANDS), ...Object.keys(ALIAS)].find((k) => k.startsWith(v));
      if (hit) { e.preventDefault(); input.value = hit; }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
    touched = true;
  });
  body.addEventListener('click', (e) => { if (!e.target.closest('a') && !window.getSelection().toString()) input.focus({ preventScroll: true }); });
  root.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => { touched = true; run(b.dataset.cmd, { typed: !reduced }); }));

  print(`${c('dim', 'Last login: ')}${new Date().toDateString()} ${c('dim', 'from your browser')}\nType ${c('k', 'help')} to get started.`);

  // Self-typing demo the first time the terminal is on screen.
  const io = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    if (reduced) { await run('neofetch'); return; }
    await wait(500);
    for (const cmd of ['neofetch', 'kubectl get pods']) {
      if (touched) return;
      await run(cmd, { typed: true });
      await wait(700);
    }
  }, { threshold: 0.45 });
  io.observe(root);

  return { run: (cmd) => run(cmd, { typed: !reduced }) };
}
