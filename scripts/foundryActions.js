import { log, thisModule, settingPackageToUse, settingCompsToUse, settingActiveCompendiums } from "./global.js";

export const getItemFromCompendium = async function (itemName) {
    let activeCompendiums = getModuleSettings(settingActiveCompendiums);
    let packs = [];
    activeCompendiums.split(',').forEach(x => {
        packs.push(game.packs.get(x));
    });

    for (let i = 0; i < packs.length; i++) {
        try {
            const packIndex = await packs[i].getIndex();
            let resultId = await packIndex.find(it => it.name.toLowerCase() == itemName.toLowerCase())["_id"];
            if (resultId != undefined) {
                return packs[i].getEntry(resultId);
            }            
        } catch (error) {
            log(`Could not find ${itemName}: ${error}`)
        }
    }
}

export const getAllActiveCompendiums = function () {
    let packs = getModuleSettings(settingPackageToUse);
    let comps = getModuleSettings(settingCompsToUse).split(',');

    if (packs.length + comps.length === 0) {
        return game.packs
            .filter((comp) => comp.metadata.entity == "Item")
            .map((comp) => {
                return `${comp.metadata.package}.${comp.metadata.name}`;
            });
    } else {
        let packArray = packs.split(',');
        packArray.forEach(packName => {
            game.packs.filter((comp) =>
                comp.metadata.entity == "Item" &&
                comp.metadata.package == packName)
                .map((comp) => {
                    comps.push(`${comp.metadata.package}.${comp.metadata.name}`);
                })
        });

        return Array.from(new Set(comps));
    }
}

export const GetAllItemCompendiums = function () {
    let comps = game.packs
        .filter((comp) => comp.metadata.entity == "Item")
        .map((comp) => {
            return `${comp.metadata.package}.${comp.metadata.name}`;
        });
    return Array.from(comps);
}

export const getAllPackageNames = function () {
    let uniquePackages = new Set(game.packs
        .filter((comp) => comp.metadata.package)
        .map((comp) => {
            return `${comp.metadata.package}`;
        }));
    return Array.from(uniquePackages);
}

export const getSpecificAdditionalStat = function (additionalStatName) {
    let additionalStats = game.settings.get("swade", "settingFields").actor
    for (const stat in additionalStats) {
        if (additionalStats[stat].label.toLowerCase() == additionalStatName.toLowerCase()) {
            return additionalStats[stat];
        }
    }
}

export const getActorAddtionalStats = function () {
    let actorAdditionalStats = game.settings.get("swade", "settingFields").actor;
    let stats = [];
    for (const key in actorAdditionalStats) {
        stats.push(`${key}:`);
    }
    return stats;
}

export const getModuleSettings = function (settingKey) {
    return game.settings.get(thisModule, settingKey);
}

export const Import = async function (actorData) {
    try {
        await Actor.create(actorData);
        ui.notifications.info(`${actorData.name} created successfully`)
    } catch (error) {
        log(`Failed to import: ${error}`)
        ui.notifications.error("Failed to import actor (see console for errors)")
    }
}

export const GetActorId = function (actorName) {
    try {
        return game.actors.getName(actorName).data._id;
    } catch (error) {
        return false;
    }
}

export const DeleteActor = async function (actorId) {
    try {
        await Actor.delete(actorId);
        ui.notifications.info(`Delete Actor with id ${actorId}`)
    } catch (error) {
        log(`Failed to delet actor: ${error}`)
    }
}

export const getAllActorFolders = function () {
    return game.folders.filter(x => x.data.type === "Actor")
        .map((comp) => {
            return `${comp.data.name}`;
        });
}

export const getFolderId = function (folderName) {
    return game.folders.getName(folderName)._id;
}

export const updateModuleSetting = async function (settingName, newValue) {
    await game.settings.set(thisModule, settingName, newValue);
}