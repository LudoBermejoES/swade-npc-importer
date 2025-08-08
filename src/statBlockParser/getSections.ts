import { getActorAddtionalStatsArray } from '../utils/foundryActions';

/**
 * Splits a statblock string into its sections based on known labels.
 */
export function getSections(clipData: string): string[] {
  const inputData = clipData
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace('/ ', '/')
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[−–]/gi, '-');
  const indexes = getSectionsIndex(inputData);
  if (indexes.length === 0) {
    throw new Error('Not a valid statblock');
  }
  const sections: string[] = indexes.map((start, i) =>
    inputData.substring(start, indexes[i + 1] ?? undefined).trim(),
  );
  return sections;
}

function getSectionsIndex(inputData: string): number[] {
  const allStatBlockEntities = [
    `${game?.i18n?.localize('npcImporter.parser.Attributes')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Skills')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Hindrances')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Edges')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Powers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Pace')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Parry')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Toughness')}:`,
    `${game?.i18n?.localize('npcImporter.parser.PowerPoints')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Gear')}:`,
    `${game?.i18n?.localize('npcImporter.parser.SpecialAbilities')}:`,
    `${game?.i18n?.localize('npcImporter.parser.SuperPowers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Conviction')}:`,
  ];

  const allStats = allStatBlockEntities.concat(getActorAddtionalStatsArray());
  const foundMatches: { index: number; pattern: string }[] = [];

  allStats.forEach(element => {
    const regex = new RegExp(
      element.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i',
    );
    const index = inputData.search(regex);
    if (index >= 0) {
      foundMatches.push({ index, pattern: element });
    }
  });

  // Sort by pattern length (longest first) to prioritize longer matches over shorter ones
  foundMatches.sort((a, b) => b.pattern.length - a.pattern.length);

  const sectionsIndex: number[] = [];
  const usedRanges: { start: number; end: number }[] = [];

  foundMatches.forEach(match => {
    const matchEnd = match.index + match.pattern.length;

    // Check if this match overlaps with any already accepted match
    const overlaps = usedRanges.some(
      range =>
        (match.index >= range.start && match.index < range.end) ||
        (matchEnd > range.start && matchEnd <= range.end) ||
        (match.index <= range.start && matchEnd >= range.end),
    );

    if (!overlaps) {
      sectionsIndex.push(match.index);
      usedRanges.push({ start: match.index, end: matchEnd });
    }
  });

  return sectionsIndex.sort((a, b) => a - b);
}
