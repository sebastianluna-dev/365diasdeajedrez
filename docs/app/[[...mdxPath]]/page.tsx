import type { Metadata } from "next";
import type { MDXComponents } from "nextra/mdx-components";
import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

interface PageProps {
  params: Promise<{ mdxPath?: string[] }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
}

// The theme always provides a wrapper; the type keeps it optional because a
// custom mdx-components file might not.
function requireWrapper(): NonNullable<MDXComponents["wrapper"]> {
  const wrapper = getMDXComponents().wrapper;
  if (!wrapper) throw new Error("nextra-theme-docs did not provide an MDX wrapper");
  return wrapper;
}

const Wrapper = requireWrapper();

export default async function Page(props: PageProps) {
  const params = await props.params;
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(params.mdxPath);

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
