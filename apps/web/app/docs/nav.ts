export interface DocPage {
  title: string;
  href: string;
}

export interface DocSection {
  title: string;
  pages: DocPage[];
}

/** Single source for the sidebar and the previous / next links at the foot of each page. */
export const DOC_SECTIONS: DocSection[] = [
  {
    title: "Start here",
    pages: [
      { title: "Introduction", href: "/docs" },
      { title: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Observability",
    pages: [
      { title: "CLI reference", href: "/docs/cli" },
      { title: "The kontract format", href: "/docs/kontract" },
      { title: "Verification and statuses", href: "/docs/verification" },
      { title: "The audit report", href: "/docs/audit-report" },
    ],
  },
  {
    title: "Runtime",
    pages: [
      { title: "Rule engine", href: "/docs/runtime/engine" },
      { title: "Rule builder", href: "/docs/runtime/builder" },
    ],
  },
];

const FLAT = DOC_SECTIONS.flatMap((section) => section.pages);

export function neighbours(href: string): { prev?: DocPage; next?: DocPage } {
  const index = FLAT.findIndex((page) => page.href === href);
  if (index === -1) return {};
  return { prev: FLAT[index - 1], next: FLAT[index + 1] };
}
