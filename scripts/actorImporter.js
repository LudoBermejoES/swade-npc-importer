import { log } from './global.js';
import { Import, GetActorId, DeleteActor, GetActorData } from './utils/foundryActions.js';

export async function actorImporter(actorDataToImport) {
  let actorId = GetActorId(actorDataToImport.name);
  let actorData = GetActorData(actorDataToImport.name)
  if (!actorId) {
    await Import(actorDataToImport);
  } else {
    await whatToDo(actorDataToImport, actorId, actorData);
  }
}

async function whatToDo(actorData, actorId, actorOriginalData) {
  let actorExists = `
    ${game.i18n.localize('npcImporter.HTML.ActorExistText')}
    <div class="form-group-dialog newName" >
        <label for="newName">${game.i18n.localize(
          'npcImporter.HTML.ChangeName'
        )}:</label>
        <input type="text" id="newName" name="newName" value="${
          actorData.name
        }">
    </dev>
    <br/>
    `;

  new Dialog({
    title: game.i18n.localize('npcImporter.HTML.ActorImporter'),
    content: actorExists,
    buttons: {
      Import: {
        label: game.i18n.localize('npcImporter.HTML.Rename'),
        callback: async () => {
          let newName = document.querySelector('#newName').value;
          log(`Import with new name: ${newName}`);
          actorData.name = newName;
          await Import(actorData);
        },
      },
      Override: {
        label: game.i18n.localize('npcImporter.HTML.Override'),
        callback: async () => {
          log('Overriding existing Actor');
          if(actorOriginalData.img) actorData.img = actorOriginalData.img;
          if(actorOriginalData.token?.texture) actorData.prototypeToken.texture = actorOriginalData.token.texture;
          await DeleteActor(actorId);
          await Import(actorData);
        },
      },
      Cancel: {
        label: 'Cancel',
        callback: () => {
          ui.notifications.info(
            game.i18n.localize('npcImporter.HTML.ActorNotImportedMsg')
          );
        },
      },
    },
  }).render(true);
}
