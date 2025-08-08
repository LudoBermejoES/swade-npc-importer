import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildActor } from '../src/actorBuilder';
import { ImportSettings } from '../src/types/importedActor';
import * as statBlockParser from '../src/statBlockParser/parseStatBlock';
import * as actorImporter from '../src/actorImporter';
import * as foundryActions from '../src/utils/foundryActions';

describe('buildActor with multiple characters (--- delimiter)', () => {
  const mockStatBlockParser = vi.fn();
  const mockActorImporter = vi.fn();
  const mockSetAllPacks = vi.fn();
  const mockResetAllPacks = vi.fn();
  const mockSetParsingLanguage = vi.fn();
  const mockUpdateModuleSetting = vi.fn();
  const mockGetModuleSettings = vi.fn();
  const mockGetFolderId = vi.fn();
  const mockGetImporterModuleData = vi.fn();

  beforeEach(() => {
    global.game = { i18n: { lang: 'en' } } as any;
    vi.spyOn(statBlockParser, 'statBlockParser').mockImplementation(
      mockStatBlockParser,
    );
    vi.spyOn(actorImporter, 'actorImporter').mockImplementation(
      mockActorImporter,
    );
    vi.spyOn(foundryActions, 'setAllPacks').mockImplementation(mockSetAllPacks);
    vi.spyOn(foundryActions, 'resetAllPacks').mockImplementation(
      mockResetAllPacks,
    );
    vi.spyOn(foundryActions, 'setParsingLanguage').mockImplementation(
      mockSetParsingLanguage,
    );
    vi.spyOn(foundryActions, 'updateModuleSetting').mockImplementation(
      mockUpdateModuleSetting,
    );
    vi.spyOn(foundryActions, 'getModuleSettings').mockImplementation(
      mockGetModuleSettings,
    );
    vi.spyOn(foundryActions, 'getFolderId').mockImplementation(mockGetFolderId);
    vi.spyOn(foundryActions, 'getImporterModuleData').mockImplementation(
      mockGetImporterModuleData,
    );

    mockStatBlockParser.mockReset();
    mockActorImporter.mockReset();
    mockSetAllPacks.mockReset();
    mockResetAllPacks.mockReset();
    mockSetParsingLanguage.mockReset();
    mockUpdateModuleSetting.mockReset();
    mockGetModuleSettings.mockReset();
    mockGetFolderId.mockReset();
    mockGetImporterModuleData.mockReset();

    // Default return values
    mockGetModuleSettings.mockReturnValue('en');
    mockGetFolderId.mockReturnValue('folderId');
    mockGetImporterModuleData.mockReturnValue({});
  });

  it('should process multiple characters separated by ---', async () => {
    const multipleCharactersText = `---
Yuki Tanaka

**Japanese, 24 years old woman**
Works at the anime merchandise store. Short with straight black hair and wearing colorful accessories.
Enthusiastic about pop culture and always recommends the latest manga.

Attributes: Agility d8, Smarts d8, Spirit d8, Strength d4, Vigor d6
Skills: Athletics d6, Common Knowledge d6, Notice d8, Performance d8, Persuasion d8, Stealth d4
Pace: 6; Parry: 4; Toughness: 5 
Gear: Anime pins, inventory scanner, colorful hair clips
---
Vladimir Petrov

**Russian, 38 years old man**
Night shift security guard with a thick beard and stern expression.
Former police officer who emigrated five years ago.
   
Attributes: Agility d6, Smarts d6, Spirit d8, Strength d8, Vigor d8
Skills: Athletics d6, Common Knowledge d4, Fighting d8, Intimidation d10, Notice d10, Shooting d6, Stealth d6
Gear: Security uniform, flashlight, radio, pepper spray`;

    const importSettings: ImportSettings = {
      actorType: 'npc',
      saveFolder: 'test-folder',
      isWildCard: false,
      tokenSettings: {},
    };

    // Mock parser to return different data for each character
    const defaultParsedData = {
      name: 'Test',
      biography: '',
      attributes: {
        agility: { die: { sides: 6, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 6, modifier: 0 } },
        strength: { die: { sides: 6, modifier: 0 } },
        vigor: { die: { sides: 6, modifier: 0 } },
      },
      skills: {},
      pace: 6,
      toughness: { value: 5, modifier: 0, armor: 0 },
      parry: 5,
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      superPowers: {},
      gear: {},
      size: 0,
    };

    mockStatBlockParser
      .mockResolvedValueOnce({ ...defaultParsedData, name: 'Yuki Tanaka' })
      .mockResolvedValueOnce({ ...defaultParsedData, name: 'Vladimir Petrov' });

    await buildActor(importSettings, multipleCharactersText);

    expect(mockStatBlockParser).toHaveBeenCalledTimes(2);
    expect(mockActorImporter).toHaveBeenCalledTimes(2);

    // Check that the first character block was parsed
    expect(mockStatBlockParser).toHaveBeenCalledWith(
      expect.stringContaining('Yuki Tanaka'),
    );

    // Check that the second character block was parsed
    expect(mockStatBlockParser).toHaveBeenCalledWith(
      expect.stringContaining('Vladimir Petrov'),
    );
  });

  it('should handle single character without --- normally', async () => {
    const singleCharacterText = `Test Character

**Test description**

Attributes: Agility d6, Smarts d6, Spirit d6, Strength d6, Vigor d6
Skills: Fighting d6, Notice d6
Pace: 6; Parry: 5; Toughness: 5`;

    const importSettings: ImportSettings = {
      actorType: 'npc',
      saveFolder: 'test-folder',
      isWildCard: false,
      tokenSettings: {},
    };

    const defaultParsedData = {
      name: 'Test Character',
      biography: '',
      attributes: {
        agility: { die: { sides: 6, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 6, modifier: 0 } },
        strength: { die: { sides: 6, modifier: 0 } },
        vigor: { die: { sides: 6, modifier: 0 } },
      },
      skills: {},
      pace: 6,
      toughness: { value: 5, modifier: 0, armor: 0 },
      parry: 5,
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      superPowers: {},
      gear: {},
      size: 0,
    };
    mockStatBlockParser.mockResolvedValue(defaultParsedData);

    await buildActor(importSettings, singleCharacterText);

    expect(mockStatBlockParser).toHaveBeenCalledTimes(1);
    expect(mockActorImporter).toHaveBeenCalledTimes(1);
    expect(mockStatBlockParser).toHaveBeenCalledWith(singleCharacterText);
  });

  it('should continue processing other characters if one fails', async () => {
    const multipleCharactersText = `---
Good Character

**Valid character**

Attributes: Agility d6, Smarts d6, Spirit d6, Strength d6, Vigor d6
Skills: Fighting d6, Notice d6
Pace: 6; Parry: 5; Toughness: 5
---
Bad Character

**Invalid character**

This will cause a parsing error
---
Another Good Character

**Another valid character**

Attributes: Agility d6, Smarts d6, Spirit d6, Strength d6, Vigor d6
Skills: Fighting d6, Notice d6
Pace: 6; Parry: 5; Toughness: 5`;

    const importSettings: ImportSettings = {
      actorType: 'npc',
      saveFolder: 'test-folder',
      isWildCard: false,
      tokenSettings: {},
    };

    const defaultParsedData = {
      name: 'Test',
      biography: '',
      attributes: {
        agility: { die: { sides: 6, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 6, modifier: 0 } },
        strength: { die: { sides: 6, modifier: 0 } },
        vigor: { die: { sides: 6, modifier: 0 } },
      },
      skills: {},
      pace: 6,
      toughness: { value: 5, modifier: 0, armor: 0 },
      parry: 5,
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      superPowers: {},
      gear: {},
      size: 0,
    };

    mockStatBlockParser
      .mockResolvedValueOnce({ ...defaultParsedData, name: 'Good Character' })
      .mockRejectedValueOnce(new Error('Parsing failed'))
      .mockResolvedValueOnce({
        ...defaultParsedData,
        name: 'Another Good Character',
      });

    await buildActor(importSettings, multipleCharactersText);

    expect(mockStatBlockParser).toHaveBeenCalledTimes(3);
    expect(mockActorImporter).toHaveBeenCalledTimes(2); // Only successful ones
  });

  it('should filter out empty blocks after splitting', async () => {
    const textWithEmptyBlocks = `---

---
Valid Character

**Test character**

Attributes: Agility d6, Smarts d6, Spirit d6, Strength d6, Vigor d6
Skills: Fighting d6, Notice d6
Pace: 6; Parry: 5; Toughness: 5
---
   
---`;

    const importSettings: ImportSettings = {
      actorType: 'npc',
      saveFolder: 'test-folder',
      isWildCard: false,
      tokenSettings: {},
    };

    const defaultParsedData = {
      name: 'Valid Character',
      biography: '',
      attributes: {
        agility: { die: { sides: 6, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 6, modifier: 0 } },
        strength: { die: { sides: 6, modifier: 0 } },
        vigor: { die: { sides: 6, modifier: 0 } },
      },
      skills: {},
      pace: 6,
      toughness: { value: 5, modifier: 0, armor: 0 },
      parry: 5,
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      superPowers: {},
      gear: {},
      size: 0,
    };
    mockStatBlockParser.mockResolvedValue(defaultParsedData);

    await buildActor(importSettings, textWithEmptyBlocks);

    expect(mockStatBlockParser).toHaveBeenCalledTimes(1);
    expect(mockActorImporter).toHaveBeenCalledTimes(1);
  });
});
