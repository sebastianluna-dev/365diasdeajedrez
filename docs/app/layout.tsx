import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

const REPOSITORY = "https://github.com/sebastianluna-dev/365diasdeajedrez";

export const metadata: Metadata = {
  title: {
    default: "365 Días de Ajedrez · Docs",
    template: "%s · 365 Días de Ajedrez Docs",
  },
  description: "Developer documentation for the 365 Días de Ajedrez public site, CMS and learning platform.",
};

const navbar = <Navbar logo={<b>365 Días de Ajedrez · Docs</b>} projectLink={REPOSITORY} />;
const footer = <Footer>365 Días de Ajedrez — internal developer documentation.</Footer>;

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase={`${REPOSITORY}/tree/main/docs`}
          // The Components section mirrors components/ file by file (~180 pages
          // in nested folders); only the active branch stays open.
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
