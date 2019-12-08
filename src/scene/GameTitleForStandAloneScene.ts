import {GamePlayerModel} from "../model/GamePlayerModel";
import {config} from "../config/config";
import {DynamicFontFactory} from "../factory/DynamicFontFactory";
import {GameSceneBase} from "./GameSceneBase";
import {addPlayer} from "../repository/model/GamePlayerRepository";
import {GameFieldScene} from "./GameFieldScene";
import {addScene} from "../repository/SceneRepository";
import {SpriteRepository} from "../repository/SpriteRepository";

const defaultStageId = 1; // TODO: 複数ステージができるまでは一旦これで行く

export class GameTitleForStandAloneScene extends GameSceneBase {
	constructor(param: g.SceneParameterObject) {
		super(param, "title");
		this.initialize();
	}

	protected onLoaded(): void {
		const backSprite = SpriteRepository.instance.generate("back_normal", this);
		this.append(backSprite);
		const titleFont = DynamicFontFactory.generateCommon(g.game, config.title.labels.title.size);
		const titleLabel = new g.Label({
			scene: this,
			text: "崩壊戦争 -体験版-",
			font: titleFont,
			fontSize: titleFont.size,
			textColor: "black",
			x: config.title.labels.title.x | 0,
			y: config.title.labels.title.y | 0,
			textAlign: g.TextAlign.Center
		});
		this.append(titleLabel);
		const messageFont = DynamicFontFactory.generateCommon(g.game, config.title.labels.push_message.size);
		const messageLabel = new g.Label({
			scene: this,
			text: "--- click this screen ---",
			font: messageFont,
			fontSize: config.title.labels.push_message.size,
			textColor: "balck",
			x: config.title.labels.push_message.x | 0,
			y: config.title.labels.push_message.y | 0,
			textAlign: g.TextAlign.Center
		});
		this.append(messageLabel);
		this.pointUpCapture.add(() => {
			// 本当はステージ選択画面とかに飛びたいが、まだできてないので一旦デフォルトのゲームステージに飛ぶ
			const myCamera = new g.Camera2D({ game: g.game });
			g.game.focusingCamera = myCamera;
			addPlayer(new GamePlayerModel({
				id: g.game.selfId,
				state: "play",
				camera: myCamera,
				team: "ally",
				money: config.game.player.default_money,
				stageId: defaultStageId
			}));
			const scene　= new GameFieldScene({game: g.game, assetIds: config.game.asset_ids}, defaultStageId, "testArrangement");
			addScene(scene);
		});
	}
}
