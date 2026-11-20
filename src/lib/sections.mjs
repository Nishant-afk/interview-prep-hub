// Single source of truth for site sections. Used by astro.config.mjs (sidebar),
// the question validator, and the Test Centre / progress widgets.
// `weight` is the share of questions in the mixed mock test.

/** @type {{ id: string, label: string, short: string, weight: number, quiz: boolean }[]} */
export const SECTIONS = [
  { id: 'csharp', label: 'C# & .NET Runtime', short: 'C#', weight: 20, quiz: true },
  { id: 'aspnet', label: 'ASP.NET Core Web API', short: 'ASP.NET', weight: 15, quiz: true },
  { id: 'data', label: 'EF Core & SQL Server', short: 'EF/SQL', weight: 12, quiz: true },
  { id: 'angular', label: 'Angular', short: 'Angular', weight: 20, quiz: true },
  { id: 'web', label: 'TypeScript, JS, HTML & CSS', short: 'TS/JS', weight: 6, quiz: true },
  { id: 'dsa', label: 'DSA & Coding', short: 'DSA', weight: 4, quiz: true },
  { id: 'system-design', label: 'System Design (HLD + LLD)', short: 'Sys Design', weight: 6, quiz: true },
  { id: 'microservices', label: 'Microservices & Messaging', short: 'Microservices', weight: 5, quiz: true },
  { id: 'patterns', label: 'Design Patterns & Architecture', short: 'Patterns', weight: 4, quiz: true },
  { id: 'fundamentals', label: 'CS Fundamentals', short: 'Fundamentals', weight: 3, quiz: true },
  { id: 'security', label: 'Security', short: 'Security', weight: 2, quiz: true },
  { id: 'testing-devops', label: 'Testing, Docker, K8s & DevOps', short: 'DevOps', weight: 3, quiz: true },
  { id: 'behavioral', label: 'Behavioral & HR', short: 'Behavioral', weight: 0, quiz: false },
  { id: 'revision', label: 'Revision', short: 'Revision', weight: 0, quiz: false },
];

export const QUIZ_SECTIONS = SECTIONS.filter((s) => s.quiz);
export const SECTION_IDS = SECTIONS.map((s) => s.id);
