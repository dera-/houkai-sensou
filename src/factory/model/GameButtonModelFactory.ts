import {GameButtonModel} from "../../model/GameButtonModel";
import {SpriteRepository} from "../../repository/SpriteRepository";
import {GamePlayerModel} from "../../model/GamePlayerModel";
import {DynamicFontFactory} from "../DynamicFontFactory";

const DEFAULT_FONT_SIZE = 18;

export class GameButtonModelFactory {
	private static _instance: GameButtonModelFactory;

	private constructor() {}

	public static get instance(): GameButtonModelFactory {
		if (!this._instance) {
			this._instance = new GameButtonModelFactory();
		}
		return this._instance;
	}

	generate(
		scene: g.Scene,
		targetCameras: g.Camera2D[],
		x: number,
		y: number,
		messages: string[],
		isSwitcher: boolean = false,
		width?: number,
		height?: number,
		fontSize: number = DEFAULT_FONT_SIZE
	): GameButtonModel {
		const sprite = SpriteRepository.instance.generate("button", scene, targetCameras);
		sprite.x = x;
		sprite.y = y;
		if (width) {
			sprite.width = width;
		}
		if (height) {
			sprite.height = height;
		}
		sprite.modified();
		const pushedSprite = SpriteRepository.instance.generate("pushedButton", scene, targetCameras);
		pushedSprite.x = x;
		pushedSprite.y = y;
		if (width) {
			pushedSprite.width = width;
		}
		if (height) {
			pushedSprite.height = height;
		}
		pushedSprite.modified();
		const font = DynamicFontFactory.generateCommon(g.game, fontSize); // TODO g.gameはgenerateの引数から取得できるように変えたい
		const label = new g.Label({
			scene,
			text: messages.length === 0 ? "" : messages[0],
			font,
			fontSize: font.size,
			textColor: "black",
			x: sprite.x + 0.1 * sprite.width,
			y: sprite.y + 0.1 * sprite.height,
			targetCameras: targetCameras
		});
		const rect = new g.FilledRect({
			scene: scene,
			x: sprite.x,
			y: sprite.y,
			width: sprite.width,
			height: sprite.height,
			cssColor: "white",
			opacity: 0,
			targetCameras: targetCameras,
			touchable: true
		});
		return new GameButtonModel(sprite, pushedSprite, label, rect, messages, isSwitcher);
	}
}
