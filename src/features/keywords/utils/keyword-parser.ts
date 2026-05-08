export function parseKeywordsImport(text: string): { terms: string[]; skipped: number } {
  // Try to parse lines, splitting by common separators like comma, newline
  const rawTerms = text
    .split(/[\n,]/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0 && t.length <= 100);
  
  const uniqueTerms = Array.from(new Set(rawTerms));
  const skipped = rawTerms.length - uniqueTerms.length;

  return { terms: uniqueTerms, skipped };
}
