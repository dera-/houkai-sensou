import {SpriteRepository} from "../../repository/SpriteRepository";
import {GameBuildingModel} from "../../model/GameBuildingModel";
import {GameTeamType} from "../../type/GameTeamType";
import {getPlayer} from "../../repository/model/GamePlayerRepository";
import {FrameSpriteRepository} from "../../repository/FrameSpriteRepository";

export class GameBuildingModelFactory {
	private static _instance: GameBuildingModelFactory;

	private constructor() {}

	public static get instance(): GameBuildingModelFactory {
		if (!this._instance) {
			this._instance = new GameBuildingModelFactory();
		}
		return this._instance;
	}

	generate(scene: g.Scene, data: any, viewPoint: g.CommonOffset): GameBuildingModel {
		SpriteRepository.instance.register(
			data.imageId,
			{
				assetId: data.assetId,
				width: data.width,
				height: data.height,
				srcWidth: data.srcWidth,
				srcHeight: data.srcHeight,
				srcX: data.srcX,
				srcY: data.srcY,
				touchable: true
			}
		);
		// ステータス表示画面用
		FrameSpriteRepository.instance.register(
			data.imageId,
			{
				assetId: data.assetId,
				width: data.width,
				height: data.height,
				srcWidth: data.srcWidth,
				srcHeight: data.srcWidth,
				srcX: data.srcX,
				srcY: data.srcY,
				frames: [0]
			}
		);
		// TODO 外側からカメラを渡せるようにする
		const myCamera = getPlayer(g.game.selfId).camera;
		const sprite = SpriteRepository.instance.generate(data.imageId, scene, [myCamera]);
		sprite.x = data.x - viewPoint.x;
		sprite.y = data.y - viewPoint.y;
		return new GameBuildingModel(
			{
				id: data.id,
				name: data.name,
				imageId: data.imageId,
				maxHp: data.maxHp,
				money: data.money,
				recover: data.recover,
				attack: data.attack,
				defense: data.defense,
				speed: data.speed,
				cost: data.cost,
				buildingType: data.buildingType,
				sprite,
				affiliation: data.affiliation,
				absolutePlace: {x: data.x, y: data.y}
			}
		);
	}
}
