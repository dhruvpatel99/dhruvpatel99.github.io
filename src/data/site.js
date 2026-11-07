/**
 * Everything personal lives here: name, contact, links and the headline numbers.
 * Change a value once and the header, hero, menu, contact, footer and command
 * palette all pick it up. Keep every number real.
 */
export const SITE = {
  name: 'Dhruv Patel',
  shortName: 'Dhruv',
  role: 'DevOps & Support Engineer',
  roleLong: 'Support Engineer (DevOps) at Naapbooks',
  location: 'Ahmedabad, Gujarat, India',
  availability: 'Open to DevOps and support roles',
  url: 'https://dhruvpatel99.github.io/',
  email: 'dhruv00987@gmail.com',
  resume: 'resume.pdf',
  links: {
    github: 'https://github.com/dhruvpatel99',
    linkedin: 'https://www.linkedin.com/in/dhruv0911',
  },
  // Used by the motion toggle so the choice is remembered per site.
  storageKey: 'dhruvpatel-portfolio',
};

/** Hero proof points. Only verified numbers. */
export const METRICS = [
  { value: 14, suffix: '+', label: 'applications on CI/CD' },
  { value: 4, suffix: '', label: 'pipelines in production' },
  { value: 25, suffix: '', label: 'containers managed, 6 on k3s' },
];

/** Sections in page order: used by the header, the mobile menu and the command palette. */
export const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'ops', label: 'Ops' },
  { id: 'stack', label: 'Stack' },
  { id: 'shell', label: 'Shell' },
  { id: 'contact', label: 'Contact' },
];
