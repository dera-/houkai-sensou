import {GameCharacterModel} from "../../model/GameCharacterModel";
import {FrameSpriteRepository} from "../../repository/FrameSpriteRepository";
import {config} from "../../config/config";
import {GameTeamType} from "../../type/GameTeamType";
import {getPlayer} from "../../repository/model/GamePlayerRepository";

export class GameCharacterModelFactory {
	private static _instance: GameCharacterModelFactory;

	private constructor() {}

	public static get instance(): GameCharacterModelFactory {
		if (!this._instance) {
			this._instance = new GameCharacterModelFactory();
		}
		return this._instance;
	}

	generate(scene: g.Scene, data: any, viewPoint: g.CommonOffset): GameCharacterModel {
		FrameSpriteRepository.instance.register(
			data.imageId,
			{
				assetId: data.assetId,
				width: config.game.map_chip.size,
				height: config.game.map_chip.size,
				srcWidth: config.game.map_chip.size,
				srcHeight: config.game.map_chip.size,
				frames: GameCharacterModel.getAnimation(data.animation),
				interval: config.game.character.interval.normal,
				touchable: true
			}
		);
		// TODO 外側からカメラを渡せるようにする
		const myCamera = getPlayer(g.game.selfId).camera;
		const sprite = FrameSpriteRepository.instance.generate(data.imageId, scene, [myCamera]);
		sprite.x = data.x - viewPoint.x;
		sprite.y = data.y - viewPoint.y;
		return new GameCharacterModel(
			{
				id: data.id,
				name: data.name,
				imageId: data.imageId,
				maxHp: data.maxHp,
				cost: data.cost,
				attack: data.attack,
				defense: data.defense,
				speed: data.speed,
				sprite,
				affiliation: data.affiliation,
				absolutePlace: {x: data.x, y: data.y},
				personality: data.personality
			}
		);
	}
}