import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildActorItems } from '../../src/dataBuilders/buildActorItems';
import * as itemBuilders from '../../src/dataBuilders/itemBuilders';
import { specialAbilitiesParser } from '../../src/dataBuilders/buildActorItemsSpecialAbilities';
import { itemGearBuilder } from '../../src/dataBuilders/buildActorGear';
import { ParsedActor } from '../../src/types/importedActor';
import { ItemType } from '../../src/types/enums';

// Mock all the builder functions
vi.mock('../../src/dataBuilders/itemBuilders', () => ({
  skillBuilder: vi.fn(),
  edgeBuilder: vi.fn(),
  hindranceBuilder: vi.fn(),
  powerBuilder: vi.fn(),
  superPowerBuilder: vi.fn(),
}));

vi.mock('../../src/dataBuilders/buildActorItemsSpecialAbilities', () => ({
  specialAbilitiesParser: vi.fn(),
}));

vi.mock('../../src/dataBuilders/buildActorGear', () => ({
  itemGearBuilder: vi.fn(),
}));

describe('buildActorItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls all item builders and combines results', async () => {
    // Mock return values for each builder
    const mockSkills = [{ name: 'Fighting', type: ItemType.SKILL }];
    const mockEdges = [{ name: 'Combat Reflexes', type: ItemType.EDGE }];
    const mockHindrances = [{ name: 'Arrogant', type: ItemType.HINDRANCE }];
    const mockPowers = [{ name: 'Bolt', type: ItemType.POWER }];
    const mockSuperPowers = [{ name: 'Flight', type: ItemType.SUPERPOWER }];
    const mockSpecialAbilities = [{ name: 'Fear', type: ItemType.ABILITY }];
    const mockGear = [{ name: 'Sword', type: ItemType.WEAPON }];

    vi.mocked(itemBuilders.skillBuilder).mockResolvedValue(mockSkills);
    vi.mocked(itemBuilders.edgeBuilder).mockResolvedValue(mockEdges);
    vi.mocked(itemBuilders.hindranceBuilder).mockResolvedValue(mockHindrances);
    vi.mocked(itemBuilders.powerBuilder).mockResolvedValue(mockPowers);
    vi.mocked(itemBuilders.superPowerBuilder).mockResolvedValue(
      mockSuperPowers,
    );
    vi.mocked(specialAbilitiesParser).mockResolvedValue(mockSpecialAbilities);
    vi.mocked(itemGearBuilder).mockResolvedValue(mockGear);

    const parsedData: ParsedActor = {
      name: 'Test Hero',
      skills: { fighting: { sides: 8, modifier: 0 } },
      edges: ['Combat Reflexes'],
      hindrances: ['Arrogant'],
      powers: ['Bolt'],
      superPowers: { Flight: 'Allows flight' },
      specialAbilities: { Fear: 'Causes fear' },
      gear: { Sword: { damage: 'Str+d8' } },
      attributes: {
        agility: { die: { sides: 8, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 8, modifier: 0 } },
        strength: { die: { sides: 10, modifier: 0 } },
        vigor: { die: { sides: 8, modifier: 0 } },
      },
    };

    const result = await buildActorItems(parsedData);

    // Verify all builders were called with correct data
    expect(itemBuilders.skillBuilder).toHaveBeenCalledWith(parsedData.skills);
    expect(itemBuilders.edgeBuilder).toHaveBeenCalledWith(parsedData.edges);
    expect(itemBuilders.hindranceBuilder).toHaveBeenCalledWith(
      parsedData.hindrances,
    );
    expect(itemBuilders.powerBuilder).toHaveBeenCalledWith(parsedData.powers);
    expect(itemBuilders.superPowerBuilder).toHaveBeenCalledWith(
      parsedData.superPowers,
    );
    expect(specialAbilitiesParser).toHaveBeenCalledWith(
      parsedData.specialAbilities,
    );
    expect(itemGearBuilder).toHaveBeenCalledWith(parsedData.gear);

    // Verify all items are included in the result
    expect(result).toHaveLength(7);
    expect(result).toContainEqual(mockSkills[0]);
    expect(result).toContainEqual(mockEdges[0]);
    expect(result).toContainEqual(mockHindrances[0]);
    expect(result).toContainEqual(mockPowers[0]);
    expect(result).toContainEqual(mockSuperPowers[0]);
    expect(result).toContainEqual(mockSpecialAbilities[0]);
    expect(result).toContainEqual(mockGear[0]);
  });

  it('handles missing superPowers data gracefully', async () => {
    // Mock return values
    vi.mocked(itemBuilders.skillBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.edgeBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.hindranceBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.powerBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.superPowerBuilder).mockResolvedValue([]);
    vi.mocked(specialAbilitiesParser).mockResolvedValue([]);
    vi.mocked(itemGearBuilder).mockResolvedValue([]);

    const parsedData: ParsedActor = {
      name: 'Test Character',
      attributes: {
        agility: { die: { sides: 8, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 8, modifier: 0 } },
        strength: { die: { sides: 10, modifier: 0 } },
        vigor: { die: { sides: 8, modifier: 0 } },
      },
      // superPowers is undefined
    };

    const result = await buildActorItems(parsedData);

    // Should call superPowerBuilder with empty object as fallback
    expect(itemBuilders.superPowerBuilder).toHaveBeenCalledWith({});
    expect(result).toEqual([]);
  });

  it('handles empty superPowers object', async () => {
    // Mock return values
    vi.mocked(itemBuilders.skillBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.edgeBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.hindranceBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.powerBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.superPowerBuilder).mockResolvedValue([]);
    vi.mocked(specialAbilitiesParser).mockResolvedValue([]);
    vi.mocked(itemGearBuilder).mockResolvedValue([]);

    const parsedData: ParsedActor = {
      name: 'Test Character',
      superPowers: {}, // Empty object
      attributes: {
        agility: { die: { sides: 8, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 8, modifier: 0 } },
        strength: { die: { sides: 10, modifier: 0 } },
        vigor: { die: { sides: 8, modifier: 0 } },
      },
    };

    const result = await buildActorItems(parsedData);

    expect(itemBuilders.superPowerBuilder).toHaveBeenCalledWith({});
    expect(result).toEqual([]);
  });

  it('includes superPowers in the correct position in items array', async () => {
    // Mock return values to verify order
    const mockPowers = [{ name: 'Bolt', type: ItemType.POWER, order: 'power' }];
    const mockSuperPowers = [
      { name: 'Flight', type: ItemType.SUPERPOWER, order: 'superpower' },
    ];
    const mockSpecialAbilities = [
      { name: 'Fear', type: ItemType.ABILITY, order: 'ability' },
    ];

    vi.mocked(itemBuilders.skillBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.edgeBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.hindranceBuilder).mockResolvedValue([]);
    vi.mocked(itemBuilders.powerBuilder).mockResolvedValue(mockPowers);
    vi.mocked(itemBuilders.superPowerBuilder).mockResolvedValue(
      mockSuperPowers,
    );
    vi.mocked(specialAbilitiesParser).mockResolvedValue(mockSpecialAbilities);
    vi.mocked(itemGearBuilder).mockResolvedValue([]);

    const parsedData: ParsedActor = {
      name: 'Test Hero',
      powers: ['Bolt'],
      superPowers: { Flight: 'Allows flight' },
      specialAbilities: { Fear: 'Causes fear' },
      attributes: {
        agility: { die: { sides: 8, modifier: 0 } },
        smarts: { die: { sides: 6, modifier: 0 }, animal: false },
        spirit: { die: { sides: 8, modifier: 0 } },
        strength: { die: { sides: 10, modifier: 0 } },
        vigor: { die: { sides: 8, modifier: 0 } },
      },
    };

    const result = await buildActorItems(parsedData);

    // Verify superPowers come after powers but before specialAbilities
    expect(result).toHaveLength(3);
    expect(result[0].order).toBe('power');
    expect(result[1].order).toBe('superpower');
    expect(result[2].order).toBe('ability');
  });
});
