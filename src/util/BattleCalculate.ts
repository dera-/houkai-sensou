import {GameLifeObjectModel} from "../model/GameLifeObjectModel";
import {GameBuildingModel} from "../model/GameBuildingModel";
import {GameCharacterModel} from "../model/GameCharacterModel";

export const getDamage = (attacker: GameCharacterModel, defenser: GameLifeObjectModel) => {
	if (defenser instanceof GameCharacterModel) {
		return Math.round(Math.pow(attacker.attack, 2) / (attacker.attack + defenser.defense));
	} else {
		return attacker.attack;
	}
};
