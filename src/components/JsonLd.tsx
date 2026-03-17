/**
 * JSON-LD Script component for Schema.org structured data
 * This renders properly in the HTML head for search engines
 */

interface JsonLdProps {
  data: object | object[];
}

export default function JsonLd({ data }: JsonLdProps) {
  const jsonLdString = JSON.stringify(Array.isArray(data) ? data : [data]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
}
