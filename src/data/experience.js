/**
 * Work history, education and the "what I'm trusted with" list.
 * Real dates and descriptions only.
 */
export const EXPERIENCE = [
  {
    role: 'Support Engineer',
    org: 'Naapbooks Limited',
    place: 'Ahmedabad',
    when: 'Jul 2025 – now',
    current: true,
    summary: 'Production support with a growing share of DevOps: pipelines, IIS and Linux deploys, containers and monitoring.',
    products: ['VizMan', 'InsiderQ', 'eNotary'],
    points: [
      'Build and maintain CI/CD pipelines for 14+ applications (4 production, 10+ internal and staging) with GitHub Actions and Jenkins.',
      'Scripted builds and IIS deployments for .NET and Flutter Web applications, replacing manual release steps, with PowerShell health checks before go-live.',
      'Jenkins pipelines that deploy an API service and an IIS-hosted UI, including database schema migrations with Alembic.',
      'A Linux Jenkins pipeline that deploys a production web application to a shared Ubuntu 22.04 server hosting 7 domains on every push to staging.',
      'GitHub Actions pipeline for an Umbraco site with a self-hosted runner on an on-prem Ubuntu server, with no SSH keys stored in GitHub and least-privilege sudo for the deploy user.',
      'Environment-based configuration, secure secrets management and rollback-ready deployments; self-hosted runners for on-premises deployments.',
      'Moved eNotary’s 6 containers from Docker to Kubernetes (k3s) for zero-downtime deployments; 25 containers for 3 products in total.',
      'Role-based access control (RBAC) in MySQL.',
      'Resolved ASP.NET Core startup failures (HTTP 500.30) and service outages (HTTP 503) on production IIS servers; L1/L2 support.',
      'Rolled out standard email signatures to all Microsoft 365 mailboxes with Exchange Online PowerShell, piloting first.',
    ],
  },
  {
    role: 'Penetration Testing Intern',
    org: 'Alicorn Solutions',
    place: 'Ahmedabad',
    when: 'Jan – Apr 2025',
    current: false,
    summary: 'Web application security testing against the OWASP Top 10.',
    products: [],
    points: [
      'Penetration testing and vulnerability assessments of web applications against the OWASP Top 10.',
      'Vulnerability reports with clear fixes for development teams, working with senior analysts.',
    ],
  },
];

export const EDUCATION = [
  { title: 'B.Tech, Cybersecurity', org: 'Silver Oak University', when: '2022 – 2025' },
  { title: 'Diploma, Computer Engineering', org: 'VPMP Polytechnic', when: '2018 – 2022' },
];

export const SKILLS = [
  { title: 'CI/CD engineering', text: 'Pipelines for 14+ applications, 4 in production, sped up with dependency caching and parallel jobs.', tags: ['GitHub Actions', 'Jenkins', 'Self-hosted runners'] },
  { title: 'Windows and IIS deployments', text: 'Scripted builds and IIS releases with PowerShell health checks before go-live and rollback-ready configuration.', tags: ['IIS', 'Windows Server', 'PowerShell'] },
  { title: 'Containers and orchestration', text: '25 Docker containers for 3 products on Ubuntu 22.04. The first 6 now run on k3s for zero-downtime deployments.', tags: ['Docker', 'Kubernetes (k3s)', 'Linux'] },
  { title: 'Monitoring and alerting', text: 'Metrics, logs and alerts for IIS-hosted .NET applications in one place, which cut troubleshooting time.', tags: ['Prometheus', 'Grafana', 'Loki'] },
  { title: 'Production support', text: 'L1/L2 support for infrastructure and applications, including HTTP 500.30 and 503 outages on production IIS.', tags: ['Troubleshooting', 'Active Directory', 'Microsoft 365'] },
  { title: 'Security and access', text: 'Web application testing against the OWASP Top 10, role-based access in MySQL, and secrets kept out of pipelines.', tags: ['OWASP Top 10', 'MySQL RBAC', 'Secrets management'] },
];

/** Tools, grouped, each with what I actually use it for. */
export const TOOL_GROUPS = [
  {
    name: 'CI/CD & automation',
    tools: [
      ['GitHub Actions', 'Application pipelines with self-hosted runners for on-premises deploys. Also deploys this site.'],
      ['Jenkins', 'Deploys an API service and an IIS UI with Alembic migrations, and a Linux app on every push to staging.'],
      ['PowerShell', 'Pre-go-live health checks and the Exchange Online email signature rollout.'],
      ['Ansible', 'Configuration management in my infrastructure-as-code lab, next to Terraform.'],
      ['Git', 'Branch-based releases: a push to staging deploys to the server.'],
    ],
  },
  {
    name: 'Infrastructure',
    tools: [
      ['Docker', '25 containers for 3 products on an Ubuntu 22.04 staging server, run with Docker Compose.'],
      ['Kubernetes (k3s)', 'eNotary’s 6 containers run on k3s for zero-downtime deployments; the rest are next.'],
      ['Terraform', 'Provisions Ubuntu Server VMs on Hyper-V in my lab, reproducible from Git.'],
      ['IIS', 'Hosts VizMan, InsiderQ and eNotary; fixed 500.30 and 503 failures in production.'],
      ['Windows Server', 'Runs the IIS applications I deploy and support, with Active Directory.'],
      ['Linux (Ubuntu)', 'Docker host and a shared web server that serves 7 domains.'],
    ],
  },
  {
    name: 'Observability',
    tools: [
      ['Prometheus', 'Collects server and API metrics from IIS-hosted .NET applications.'],
      ['Grafana', 'Real-time dashboards and alerts for resource use and application failures.'],
      ['Loki + Promtail', 'Central logs next to the metrics, so issues are found faster.'],
    ],
  },
  {
    name: 'Data & cloud',
    tools: [
      ['AWS', 'Serverless helpdesk: Lambda, API Gateway and DynamoDB, served by CloudFront from a private S3 bucket.'],
      ['MySQL', 'Role-based access control set up with roles and grants.'],
      ['PostgreSQL', 'Administered with pgAdmin.'],
    ],
  },
];
