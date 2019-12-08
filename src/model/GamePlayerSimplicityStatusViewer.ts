import {GamePlayerModel} from "./GamePlayerModel";
import {DynamicFontFactory} from "../factory/DynamicFontFactory";
import {FrameSpriteRepository} from "../repository/FrameSpriteRepository";
import {config} from "../config/config";
import {GameButtonModel} from "./GameButtonModel";
import {GameButtonModelFactory} from "../factory/model/GameButtonModelFactory";
import {SpriteRepository} from "../repository/SpriteRepository";
import {getPlayer} from "../repository/model/GamePlayerRepository";

// TODO: これのfactoryを作りたい。コンストラクタでやっていることを全部factoryに移す感じで。
export class GamePlayerSimplicityStatusViewer {
	private _frameSprite: g.Sprite;
	private _goldIconSprite: g.FrameSprite;
	private _moneyLabel: g.Label;
	private _modeButton: GameButtonModel;
	private _statusViewPane: g.Pane;
	private _statusIconSprite: g.FrameSprite;
	private _statusDetailLabel: g.Label;

	constructor(scene: g.Scene, playerModel: GamePlayerModel) {
		const targetCameras = [playerModel.camera];
		this._frameSprite = this.generateOptionFrame(scene, targetCameras);
		this._goldIconSprite = this.generateGoldIconSprite(scene, targetCameras);
		this._moneyLabel = this.generateMoneyLabel(scene, targetCameras, playerModel.money);
		this._modeButton = this.generateModeButton(scene, targetCameras);
	}

	get modeButton(): GameButtonModel {
		return this._modeButton;
	}

	get moneyLabel(): g.Label {
		return this._moneyLabel;
	}

	addSpriteGroup(scene: g.Scene, playerModel: GamePlayerModel): void {
		scene.append(this._frameSprite);
		scene.append(this._goldIconSprite);
		scene.append(this._moneyLabel);
		this._modeButton.registerSpriteGroup(scene);
		scene.append(this.getStatusViewPane(scene));
	}

	removeSpriteGroup(scene: g.Scene): void {
		scene.remove(this._frameSprite);
		scene.remove(this._goldIconSprite);
		scene.remove(this._moneyLabel);
		this._modeButton.removeSpriteGroup(scene);
		scene.remove(this.getStatusViewPane(scene));
	}

	updateMoneyLabel(playerModel: GamePlayerModel): void {
		if (this._moneyLabel === undefined) {
			return;
		}
		this._moneyLabel.text = playerModel.money.toString();
		this._moneyLabel.invalidate();
	}

	getStatusViewPane(scene: g.Scene): g.Pane {
		if (!this._statusViewPane) {
			const myCamera = getPlayer(g.game.selfId).camera;
			const paneWidth = config.game.option_space.status_view.width;
			const paneHeight = config.game.option_space.status_view.height;
			this._statusViewPane = new g.Pane({
				scene,
				x: config.game.option_space.status_view.x,
				y: config.game.option_space.status_view.y,
				width: paneWidth,
				height: paneHeight,
				targetCameras: [myCamera]
			});
			this._statusViewPane.append(this.getStatusIconSprite(scene, paneWidth, paneHeight, myCamera));
			this._statusViewPane.append(this.getStatusDetailLabel(scene, paneWidth, paneHeight, myCamera));
		}
		return this._statusViewPane;
	}

	changeStatusViewPane(scene: g.Scene, frameSpriteId: string, text: string, frames?: number[]): void {
		this._statusDetailLabel.text = text;
		this._statusDetailLabel.invalidate();
		const frameSpriteParam = FrameSpriteRepository.instance.get(frameSpriteId);
		this._statusIconSprite.surface = g.Util.asSurface(scene.assets[frameSpriteParam.assetId] as g.ImageAsset);
		this._statusIconSprite.srcWidth = frameSpriteParam.srcWidth;
		this._statusIconSprite.srcHeight = frameSpriteParam.srcHeight;
		this._statusIconSprite.srcX = frameSpriteParam.srcX || 0;
		this._statusIconSprite.srcY = frameSpriteParam.srcY || 0;
		this._statusIconSprite.frames = frames || frameSpriteParam.frames;
		this._statusIconSprite.invalidate();
		this._statusIconSprite.modified();
		this._statusIconSprite.start();
	}

	private getStatusIconSprite(scene: g.Scene, paneWidth: number, paneHeight: number, myCamera: g.Camera2D): g.FrameSprite {
		this._statusIconSprite = FrameSpriteRepository.instance.generate("default_icon", scene, [myCamera]);
		this._statusIconSprite.width = config.game.option_space.status_view.target_icon.width;
		this._statusIconSprite.height = config.game.option_space.status_view.target_icon.height;
		this._statusIconSprite.x = config.game.option_space.status_view.target_icon.x_rate * paneWidth;
		this._statusIconSprite.y = config.game.option_space.status_view.target_icon.y_rate * paneHeight;
		this._statusIconSprite.interval = 250;
		return this._statusIconSprite;
	}

	private getStatusDetailLabel(scene: g.Scene, paneWidth: number, paneHeight: number, myCamera: g.Camera2D): g.Label {
		const font = DynamicFontFactory.generateCommon(g.game, config.game.option_space.status_view.target_detail.size);
		this._statusDetailLabel = new g.Label({
			scene,
			text: "",
			font,
			fontSize: font.size,
			textColor: "white",
			x: config.game.option_space.status_view.target_detail.x_rate * paneWidth,
			y: config.game.option_space.status_view.target_detail.y_rate * paneHeight,
			targetCameras: [myCamera]
		});
		return this._statusDetailLabel;
	}

	private generateOptionFrame(scene: g.Scene, targetCameras: g.Camera2D[]): g.Sprite {
		const optionFrame = SpriteRepository.instance.generate("option_frame", scene, targetCameras);
		optionFrame.touchable = true;
		return optionFrame;
	}

	private generateGoldIconSprite(scene: g.Scene, targetCameras: g.Camera2D[]): g.FrameSprite {
		const goldIconSprite = FrameSpriteRepository.instance.generate("gold", scene, targetCameras);
		goldIconSprite.x = config.game.option_space.x;
		goldIconSprite.y = config.game.option_space.y;
		return goldIconSprite;
	}

	private generateMoneyLabel(scene: g.Scene, targetCameras: g.Camera2D[], money: number): g.Label {
		const font = DynamicFontFactory.generateCommon(g.game, 32);
		const moneyLabel = new g.Label({
			scene,
			text: money.toString(),
			font,
			fontSize: font.size,
			textColor: "white",
			targetCameras: targetCameras
		});
		moneyLabel.x = this._goldIconSprite.x + this._goldIconSprite.width;
		moneyLabel.y = this._goldIconSprite.y;
		return moneyLabel;
	}

	private generateModeButton(scene: g.Scene, targetCameras: g.Camera2D[]): GameButtonModel {
		return GameButtonModelFactory.instance.generate(
			scene,
			targetCameras,
			config.game.option_space.mode_button.x,
			config.game.option_space.mode_button.y,
			["戦闘", "交渉"]
		);
	}
}
