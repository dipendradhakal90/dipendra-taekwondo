import { Helmet } from "react-helmet-async";
import { buildPageMeta } from "../../utils/seo";

/**
 * PageHead Component
 * Reusable component for setting page-specific meta tags and structured data
 */
export default function PageHead({
  title,
  description,
  image,
  path,
  type = "website",
  structuredData,
}) {
  const meta = buildPageMeta({ title, description, path, image, type });

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <link rel="canonical" href={meta.canonical} />
      
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
