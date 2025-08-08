import { getActorId, deleteActor, importActor } from './utils/foundryActions';
import { SwadeActorToImport } from './types/importedActor';
import { Logger } from './utils/logger';
import { foundryI18nLocalize, foundryUiInfo } from './utils/foundryWrappers';

export async function actorImporter(
  actorDataToImport: SwadeActorToImport,
): Promise<void> {
  if (!actorDataToImport.name) {
    Logger.warn('actorImporter: Missing actor name.');
    return;
  }

  // Check if the name contains "|" for multiple characters
  if (actorDataToImport.name.includes('|')) {
    await importMultipleActors(actorDataToImport);
    return;
  }

  let actorId = getActorId(actorDataToImport.name);
  if (!actorId) {
    await safeImport(actorDataToImport);
  } else {
    await whatToDo(actorDataToImport, actorId);
  }
}

async function importMultipleActors(
  actorDataToImport: SwadeActorToImport,
): Promise<void> {
  const names = actorDataToImport.name
    .split('|')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (names.length === 0) {
    Logger.warn('actorImporter: No valid names found after splitting.');
    return;
  }

  Logger.info(`Importing multiple characters: ${names.join(', ')}`);

  for (const name of names) {
    // Create a copy of the actor data with the individual name
    const individualActorData = { ...actorDataToImport, name };

    let actorId = getActorId(name);
    if (!actorId) {
      await safeImport(individualActorData);
    } else {
      await whatToDo(individualActorData, actorId);
    }
  }
}

async function safeImport(actorData: SwadeActorToImport) {
  try {
    await importActor(actorData);
  } catch (error) {
    Logger.error('Failed to import actor:', error);
    foundryUiInfo(foundryI18nLocalize('npcImporter.HTML.ActorImportError'));
  }
}

async function whatToDo(
  actorData: SwadeActorToImport,
  actorId: string,
): Promise<void> {
  let actorExists = `
    ${foundryI18nLocalize('npcImporter.HTML.ActorExistText')}
    <div class="form-group-dialog newName" >
        <label for="newName">${foundryI18nLocalize(
          'npcImporter.HTML.ChangeName',
        )}:</label>
        <input type="text" id="newName" name="newName" value="${
          actorData.name ?? ''
        }">
    </div>
    <br/>
    `;

  const dialog = new foundry.applications.api.DialogV2({
    window: {
      title: foundryI18nLocalize('npcImporter.HTML.ActorImporter'),
    },
    position: {
      width: 400,
    },
    content: actorExists,
    buttons: [
      {
        action: 'import',
        label: foundryI18nLocalize('npcImporter.HTML.Rename'),
        callback: async () => {
          try {
            const newNameInput = document.querySelector(
              '#newName',
            ) as HTMLInputElement | null;
            if (!newNameInput) {
              foundryUiInfo(
                foundryI18nLocalize('npcImporter.HTML.NameInputMissing'),
              );
              return;
            }
            let newName = newNameInput.value;
            Logger.info(`Import with new name: ${newName}`);
            actorData.name = newName;
            await safeImport(actorData);
          } catch (error) {
            Logger.error('Rename import failed:', error);
            foundryUiInfo(
              foundryI18nLocalize('npcImporter.HTML.ActorImportError'),
            );
          }
        },
      },
      {
        action: 'override',
        label: foundryI18nLocalize('npcImporter.HTML.Override'),
        callback: async () => {
          try {
            Logger.info('Overriding existing Actor');
            await deleteActor(actorId);
            await safeImport(actorData);
          } catch (error) {
            Logger.error('Override import failed:', error);
            foundryUiInfo(
              foundryI18nLocalize('npcImporter.HTML.ActorImportError'),
            );
          }
        },
        default: true,
      },
      {
        action: 'cancel',
        label: foundryI18nLocalize('npcImporter.HTML.Cancel'),
        callback: () => {
          foundryUiInfo(
            foundryI18nLocalize('npcImporter.HTML.ActorNotImportedMsg'),
          );
        },
      },
    ],
  });

  dialog.render({ force: true });

  // Focus the input field when the dialog is rendered
  setTimeout(() => {
    const newNameInput = document.querySelector(
      '#newName',
    ) as HTMLInputElement | null;
    if (newNameInput) {
      newNameInput.focus();
      newNameInput.select();
    }
  }, 100);
}
