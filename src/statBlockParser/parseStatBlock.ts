import { ParsedActor } from '../types/importedActor';
import { getSections } from './getSections';
import { getBio, getName } from './getNameAndDesc';
import { getAttributes, getSkills } from './getTraits';
import { getListStat, ListType } from './getListsStats';
import { AbilityType, getAbilityList } from './getAbilities';
import { getGear } from './getGear';
import { getSystemDefinedStats } from './getSystemStats';
import {
  getDerivedStats,
  DerivedStatType,
  getSize,
  powerPointsFromSpecialAbility,
  getToughness,
} from './getDerivedStats';
import { Logger } from '../utils/logger';
import { foundryI18nLocalize, foundryUiError } from '../utils/foundryWrappers';

/**
 * Parses Super Powers from sections - similar to getListStat but returns a Record<string, string>
 * Super Powers are formatted like: "Super Powers: Flight, Super Attribute (Strength), Toughness"
 */
function getSuperPowers(sections: string[]): Record<string, string> {
  const label = `${foundryI18nLocalize('npcImporter.parser.SuperPowers') || 'Super Powers'}:`;
  const line = sections.find(x => x.startsWith(label));

  if (!line) {
    return {};
  }

  const cleanLine = line
    .slice(line.indexOf(':') + 1)
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace(/\.$/, '')
    .trim();

  if (cleanLine.length <= 1) {
    return {};
  }

  const powers: Record<string, string> = {};
  const matches = cleanLine.match(
    /([A-Za-zÀ-ÖØ-öø-ÿ0-9!\-'' ]+)(\(([^\)]+)\))?/gi,
  );

  if (matches) {
    matches.forEach(match => {
      const trimmed = match.trim();
      if (trimmed) {
        powers[trimmed] = '';
      }
    });
  }

  return powers;
}

export async function statBlockParser(
  rawStatBlock: string,
): Promise<ParsedActor> {
  try {
    Logger.info('Starting statblock parsing');

    const sections = getSections(rawStatBlock);
    let importedActor: ParsedActor = {
      name: getName(rawStatBlock),
      biography: getBio(rawStatBlock, sections),
      attributes: getAttributes(sections),
      skills: getSkills(sections),
      pace: getDerivedStats(sections, DerivedStatType.Pace),
      toughness: getToughness(sections),
      parry: getDerivedStats(sections, DerivedStatType.Parry),
      powerPoints: getDerivedStats(sections, DerivedStatType.PowerPoints),
      edges: getListStat(sections, ListType.Edges),
      hindrances: getListStat(sections, ListType.Hindrances),
      powers: getListStat(sections, ListType.Powers),
      specialAbilities: getAbilityList(sections, AbilityType.SpecialAbilities),
      superPowers: getSuperPowers(sections),
      gear: await getGear(sections),
    };

    importedActor = {
      ...importedActor,
      ...getSystemDefinedStats(sections),
    };
    importedActor.size = getSize(importedActor.specialAbilities ?? {});

    if (!importedActor.powerPoints && importedActor.specialAbilities) {
      importedActor.powerPoints = powerPointsFromSpecialAbility(
        importedActor.specialAbilities,
      );
    }

    Logger.info('Parsed data', importedActor);
    return importedActor;
  } catch (error) {
    foundryUiError(foundryI18nLocalize('npcImporter.parser.NotValidStablock'));
    throw new Error(
      foundryI18nLocalize('npcImporter.parser.NotValidStablock'),
      error,
    );
  }
}
