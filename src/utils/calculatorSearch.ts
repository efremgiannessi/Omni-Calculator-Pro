import { CalculatorMeta, SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

// Remove accents / diacritics for ultra-forgiving Italian & international search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Universal search matcher for calculators.
 * Checks across:
 * - All localized titles (IT, EN, ES, FR, DE)
 * - All localized descriptions (IT, EN, ES, FR, DE)
 * - Calculator ID and badge
 * - Category names and localized category titles
 * - Rich keyword list (synonyms, slang, formulas, abbreviations, sub-topics)
 */
export function matchesCalculatorSearch(
  calc: CalculatorMeta,
  rawQuery: string,
  _currentLang?: SupportedLanguage
): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const queryNormalized = normalizeText(rawQuery);
  const queryTokens = queryNormalized.split(/\s+/).filter(Boolean);

  if (queryTokens.length === 0) return true;

  // Build a searchable corpus string containing all relevant text
  const searchCorpusParts: string[] = [];

  // 1. Calculator ID
  searchCorpusParts.push(calc.id.replace(/-/g, ' '));
  searchCorpusParts.push(calc.id);

  // 2. Category slug
  searchCorpusParts.push(calc.category.replace(/-/g, ' '));

  // 3. Badge
  if (calc.badge) {
    searchCorpusParts.push(calc.badge);
  }

  // 4. Custom Keywords
  if (calc.keywords && calc.keywords.length > 0) {
    searchCorpusParts.push(...calc.keywords);
  }

  // 5. Localized Titles, Descriptions, and Category Names in ALL supported languages
  const supportedLangs: SupportedLanguage[] = ['it', 'en', 'es', 'fr', 'de'];
  for (const lang of supportedLangs) {
    const tLang = translations[lang];
    if (tLang) {
      // Title
      const title = tLang[calc.titleKey];
      if (title) searchCorpusParts.push(title);

      // Description
      const desc = tLang[calc.descriptionKey];
      if (desc) searchCorpusParts.push(desc);

      // Category localized title
      const catKey = calc.category.replace('-', '_');
      const catTitle = tLang[catKey];
      if (catTitle) searchCorpusParts.push(catTitle);
    }
  }

  const combinedNormalizedCorpus = normalizeText(searchCorpusParts.join(' '));

  // If full phrase matches directly
  if (combinedNormalizedCorpus.includes(queryNormalized)) {
    return true;
  }

  // If all individual query words/tokens match somewhere in the corpus
  return queryTokens.every((token) => combinedNormalizedCorpus.includes(token));
}
