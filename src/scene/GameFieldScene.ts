import {GameCharacterModel} from "../model/GameCharacterModel";
import { Tile } from "@akashic-extension/akashic-tile";
import {SpriteRepository} from "../repository/SpriteRepository";
import {GameItemModel} from "../model/GameItemModel";
import {GameBuildingModel} from "../model/GameBuildingModel";
import {config} from "../config/config";
import {GameBuildingModelFactory} from "../factory/model/GameBuildingModelFactory";
import {GameItemModelFactory} from "../factory/model/GameItemModelFactory";
import {GameCharacterModelFactory} from "../factory/model/GameCharacterModelFactory";
import {GamePointerModel} from "../model/GamePointerModel";
import {GameFieldSceneEvent} from "./event/GameFieldSceneEvent";
import {GamePlayerSimplicityStatusViewer} from "../model/GamePlayerSimplicityStatusViewer";
import {addPlayer, getPlayer} from "../repository/model/GamePlayerRepository";
import {GameSceneBase} from "./GameSceneBase";
import {GameFieldModel} from "../model/GameFieldModel";
import {GamePlayerModel} from "../model/GamePlayerModel";
import {GameAutomaticPlayerModel} from "../model/GameAutomaticPlayerModel";

const DIRECTION_SPRITE_COUNTS = 10;

export class GameFieldScene extends GameSceneBase {
	private eventHolder: GameFieldSceneEvent = undefined;
	private stageId: number;
	private gameFieldModel: GameFieldModel = undefined;
	private chipsTextAssetId: string = undefined;
	private gameCharacterModels: GameCharacterModel[] = [];
	private gameItemModels: GameItemModel[] = [];
	private gameBuildingModels: GameBuildingModel[] = [];
	private simplicityStatusViewer: GamePlayerSimplicityStatusViewer;

	private pointerModels: {[key: number]: GamePointerModel} = [];
	private directionSprites: g.Sprite[] = [];
	private directionSpriteCaches: g.Sprite[] = [];

	constructor(param: g.SceneParameterObject, stageId: number, chipsTextAssetId: string) {
		super(param, "field");
		this.stageId = stageId;
		this.chipsTextAssetId = chipsTextAssetId;
		this.initialize();
	}

	protected onLoaded(): void {
		// 方向スプライトキャッシュを先に作っておく
		for (let i = 0; i < DIRECTION_SPRITE_COUNTS; i++) {
			this.directionSpriteCaches.push(SpriteRepository.instance.generate("direction", this));
		}

		// 各プロパティの初期化から
		const chipsData = JSON.parse((this.assets[this.chipsTextAssetId] as g.TextAsset).data);
		const viewPoint: g.CommonOffset = chipsData.map.viewPoint;
		// タイルの登録
		// TODO: ファクトリー作る
		const mapTile = new Tile({
			scene: this,
			src: this.assets[chipsData.map.image],
			tileWidth: config.game.map_chip.size,
			tileHeight: config.game.map_chip.size,
			tileData: JSON.parse((this.assets[chipsData.map.text] as g.TextAsset).data),
			targetCameras: [getPlayer(g.game.selfId).camera],
			touchable: true
		});
		this.gameFieldModel = new GameFieldModel({
			tile: mapTile,
			viewPoint: {x: 0, y: 0}
		});
		this.append(this.gameFieldModel.tile);

		this.gameCharacterModels = this.generateGameCharacterModels(chipsData.characters, this, viewPoint);
		this.gameItemModels = this.generateGameItemModels(chipsData.items, this, viewPoint);
		this.gameBuildingModels = this.generateGameBuildingModels(chipsData.buildings, this, viewPoint);
		this.simplicityStatusViewer = new GamePlayerSimplicityStatusViewer(this, getPlayer(g.game.selfId));

		this.eventHolder = new GameFieldSceneEvent({
			scene: this,
			stageId: this.stageId,
			gameFieldModel: this.gameFieldModel,
			gameCharacterModels: this.gameCharacterModels,
			gameItemModels: this.gameItemModels,
			gameBuildingModels: this.gameBuildingModels,
			simplicityStatusViewer: this.simplicityStatusViewer,
			pointerModels: this.pointerModels,
			directionSprites: this.directionSprites,
			directionSpriteCaches: this.directionSpriteCaches
		});

		// マップのイベント登録
		this.gameFieldModel.tile.pointMove.add(this.eventHolder.getPointMoveFieldTileEvent());


		// ゲームキャラクター関連のイベント登録
		this.gameCharacterModels.forEach((model) => {
			const charaSprite = model.sprite;
			charaSprite.update.add(this.eventHolder.getCharacterEvent(model));
			charaSprite.pointMove.add(this.eventHolder.getPointMoveCharacterEvent(model));
			charaSprite.pointUp.add(this.eventHolder.getPointUpCharacterEvent(model));
			charaSprite.pointDown.add(this.eventHolder.getShowStatusEvent(model));
			this.gameBuildingModels.forEach(buildingModel => {
				if (buildingModel.buildingType === "power-up" && model.affiliation === buildingModel.affiliation
					|| buildingModel.buildingType === "power-down" && model.affiliation !== buildingModel.affiliation) {
					model.addBuff(buildingModel.lifeId, buildingModel.buf);
				}
			});
			model.registerSpriteGroup(this);
		});

		// ゲームアイテム関連のイベント登録
		this.gameItemModels.forEach((itemModel) => {
			const itemSprite = itemModel.sprite;
			itemSprite.update.add(this.eventHolder.getItemEvent(itemModel));
			itemSprite.pointDown.add(this.eventHolder.getShowStatusEvent(itemModel));
			this.append(itemSprite);
		});

		// 建物関連のイベント登録
		this.gameBuildingModels.forEach((buildingModel) => {
			const buildingSprite = buildingModel.sprite;
			buildingSprite.update.add(this.eventHolder.getBuildingEvent(buildingModel));
			buildingSprite.pointDown.add(this.eventHolder.getShowStatusEvent(buildingModel));
			buildingModel.registerSpriteGroup(this);
		});

		// 簡易ステータス欄の表示とイベント登録
		this.simplicityStatusViewer.addSpriteGroup(this, getPlayer(g.game.selfId));
		this.simplicityStatusViewer.modeButton.rect.pointUp.add(this.eventHolder.getPointUpModeButtonEvent());

		// AIプレイヤーの登録
		const aiPlayer = new GameAutomaticPlayerModel({
			id: config.common.player_id.ai,
			state: "play",
			camera: new g.Camera2D({ game: g.game }),
			team: "enemy",
			money: config.game.player.default_money,
			stageId: this.stageId,
			characters: this.gameCharacterModels,
			buildings: this.gameBuildingModels,
			items: this.gameItemModels,
			targetAffiliation: "ally"
		});
		aiPlayer.decideGoals();
		addPlayer(aiPlayer);
		// 	TODO: 突貫で用意してしまったのであとでリファクタ
		this.setInterval(() => {
			aiPlayer.decideGoals("guardian");
		}, 2000);
	}

	private generateGameCharacterModels(characters: any[], scene: g.Scene, viewPoint: g.CommonOffset): GameCharacterModel[] {
		return characters.map((data: any) => GameCharacterModelFactory.instance.generate(scene, data, viewPoint));
	}

	private generateGameItemModels(items: any[], scene: g.Scene, viewPoint: g.CommonOffset): GameItemModel[] {
		return items.map((data: any) => GameItemModelFactory.instance.generate(scene, data, viewPoint));
	}

	private generateGameBuildingModels(buildings: any[], scene: g.Scene, viewPoint: g.CommonOffset): GameBuildingModel[] {
		return buildings.map((data: any) => GameBuildingModelFactory.instance.generate(scene, data, viewPoint));
	}
}
