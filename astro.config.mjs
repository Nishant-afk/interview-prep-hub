// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import preact from '@astrojs/preact';
import mermaid from 'astro-mermaid';
import { SECTIONS } from './src/lib/sections.mjs';

// GitHub Pages project site: https://<username>.github.io/interview-prep-hub/
// CI sets SITE_URL and BASE_PATH from the repository (see .github/workflows/deploy.yml).
// The fallback only affects canonical URLs/sitemap in local builds.
const SITE = process.env.SITE_URL ?? 'https://example.github.io';
const BASE = process.env.BASE_PATH ?? '/interview-prep-hub';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    // astro-mermaid must be registered before Starlight.
    mermaid({ theme: 'default', autoTheme: true }),
    starlight({
      title: 'Interview Prep Hub',
      description: '.NET + Angular SDE interview preparation: concepts, diagrams, code, system design and MCQ tests.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      lastUpdated: false,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      components: {
        Footer: './src/components/overrides/Footer.astro',
      },
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Study Plan', link: '/study-plan/' },
        { label: 'MCQ Test Centre', link: '/test/', badge: { text: 'Quiz', variant: 'tip' } },
        ...SECTIONS.map((s) => ({
          label: s.label,
          collapsed: true,
          items: [{ autogenerate: { directory: s.id } }],
        })),
      ],
    }),
    preact(),
  ],
});
