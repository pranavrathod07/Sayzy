import type { SpeechLanguage } from '@/types';

/**
 * Detects if text contains Hindi (Devanagari script) characters.
 * Also considers Hinglish patterns (e.g., "Kaise ho", "Khana kha liya").
 */
export function isHindiText(text: string): boolean {
  if (!text) return false;

  // Check for Devanagari script (Unicode range: U+0900 to U+097F)
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return true;
  }

  // Common Hinglish patterns - lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  const hinglishPatterns = [
    /\b(aap|aapke|ab|abhi|accha|acche|achha|achhe|aisa|aise|aisich|alag|album|ali|ali|allai|alne|aloha|already|aly|am|ama|amader|amar|amari|amba|ambai|ambait|ambali|amay|amber|ambi|amdani|amdar|ameta|ami|amin|amira|amit|amma|ammadi|ammaka|amman|amme|amu|amuck|amuhan|amuh|amulek|amulet|an|ana|anaaj|anab|anaconda|anad|anadi|anadhya|anag|anah|anai|anajo|anak|anal|anala|analai|anali|analisa|analisa|analisys|analiza|analjsa|anall|analli|anally|analoga|analogy|analysis|analyst|analyze|analysz|analyzed|analyzer|analyzes|analyzing|analysed|analysing|analysin|anam|anamai|anamica|ananaa|anand|ananda|anandi|anandita|anangas|anangha|anangkop|anangsyah|anani|ananias|ananna|ananny|anano|ananque|anansa|anansi|anansie|ananta|ananta|anantanatna|anantanatha|anantapura|anantas|anantayas|anante|ananti|anantya|ananue|ananus|ananv|ananvi|ananvica|ananya|ananyaa|ananyada|ananyaga|ananyaha|ananyahi|ananyaka|ananyam|ananyami|ananyappu|ananyar|ananyata|ananyate|ananyati|ananyatva|ananyaya|ananyaye|ananyan|ananyatiktha|anapai|anapana|anapayana|anapanasati|anapasati|anapaste|anapata|anapati|anapau|anapchasya|anapeithe|anapeit|anapektos|anapello|anaperos|anapeso|anapetho|anaphema|anaphem|anaphem|anaphersis|anaphersis|anapher|anaphoreia|anaphoresis|anaphoretic|anaphorical|anaphorically|anaphorism|anaphorite|anaphorism|anaphis|anaphius|anaphlaxis|anaphlaxis|anaphmora|anaphmora|anaphnea|anaphnoa|anaphnoba|anaphobogenesis|anaphobic|anaphnea|anaphocratoria|anaphora|anaphorais|anaphorales|anaphorales|anaphoralis|anaphoram|anaphoram|anaphora|anaphorae|anaphorally|anaphorals|anaphoram|anaphoram|anaphorams|anaphorans|anaphorans|anaphorar|anaphorara|anaphorara|anaphorari|anaphorari|anaphoraria|anaphorias|anaphorias|anaphoraia|anaphoraia|anaphoras|anaphorase|anaphorase|anaphorates|anaphorates|anaphoratic|anaphoratics|anaphorati|anaphorati|anaphoratio|anaphoratio|anaphorationis|anaphoratis|anaphoratis|anaphorator|anaphorator|anaphoratoris|anaphoratory|anaphoratory|anaphorary|anaphoray|anaphoraye|anaphoraye|anaphoraya|anaphoraya|anaphorayas|anaphorayas|anka|ankh)\b/i,
    /\b(nahin|nahi|naahi|nahi|haan|hain|hain|hain|haan|maine|mein|mera|tera|tumhara|apka|apka|unka|inká|chalo|kya|kha|khana|khao|khaao|kaho|kaise|kaisa|kaise|kaisa)\b/i,
  ];

  return hinglishPatterns.some(pattern => pattern.test(lowerText));
}

/**
 * Suggests the appropriate SpeechLanguage for given text.
 * Returns 'hi-IN' if Hindi/Hinglish is detected, otherwise 'en-US'.
 */
export function detectLanguage(text: string, defaultLang: SpeechLanguage = 'en-US'): SpeechLanguage {
  return isHindiText(text) ? 'hi-IN' : defaultLang;
}
