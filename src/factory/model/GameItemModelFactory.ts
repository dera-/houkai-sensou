import {SpriteRepository} from "../../repository/SpriteRepository";
import {GameItemModel} from "../../model/GameItemModel";
import {config} from "../../config/config";
import {getPlayer} from "../../repository/model/GamePlayerRepository";
import {FrameSpriteRepository} from "../../repository/FrameSpriteRepository";

export class GameItemModelFactory {
	private static _instance: GameItemModelFactory;

	private constructor() {}

	public static get instance(): GameItemModelFactory {
		if (!this._instance) {
			this._instance = new GameItemModelFactory();
		}
		return this._instance;
	}

	generate(scene: g.Scene, data: any, viewPoint: g.CommonOffset): GameItemModel {
		SpriteRepository.instance.register(
			data.imageId,
			{
				assetId: data.assetId,
				width: config.game.map_chip.size,
				height: config.game.map_chip.size,
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
		return new GameItemModel(
			{
				id: data.id,
				name: data.name,
				imageId: data.imageId,
				money: data.money,
				recover: data.recover,
				attack: data.attack,
				defense: data.defense,
				speed: data.speed,
				motivation: data.motivation,
				itemType: data.itemType,
				sprite,
				absolutePlace: {x: data.x, y: data.y}
			}
		);
	}
}