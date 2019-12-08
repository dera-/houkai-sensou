import {GameTeamType} from "../type/GameTeamType";
import {DynamicFontFactory} from "../factory/DynamicFontFactory";
import {GameButtonModelFactory} from "../factory/model/GameButtonModelFactory";
import {getPlayer, removePlayersFromStage} from "../repository/model/GamePlayerRepository";
import {GameSceneBase} from "./GameSceneBase";
import {setTargetScene} from "../repository/SceneRepository";
import {GameButtonModel} from "../model/GameButtonModel";
import {config} from "../config/config";
import {SpriteRepository} from "../repository/SpriteRepository";

declare const window: any;

// リザルト画面 ゲームの結果表示とタイトルに戻るボタンの表示
// TODO: 今はどのチームが勝ったの情報しかないが、そのうちチーム順位みたいなものを出すようにしたい
// まだイベント数は少ないので、Eventクラスは切らないでおく
export class GameOverScene extends GameSceneBase {
	private stageId: number;
	private loserTeam: GameTeamType;
	constructor(param: g.SceneParameterObject, stageId: number, loserTeam: GameTeamType) {
		super(param, "gameover");
		this.stageId = stageId;
		this.loserTeam = loserTeam;
		this.initialize();
	}

	protected onLoaded() {
		const player = getPlayer(g.game.selfId);
		if (getPlayer(g.game.selfId).team === this.loserTeam) {
			this.viewForLoser();
		} else {
			this.viewForWinner();
		}
		// 一応仮でここで参加した全プレイヤーの登録解除を行う
		removePlayersFromStage(this.stageId);
	}

	private viewForWinner(): void {
		const backSprite = SpriteRepository.instance.generate("back_normal", this);
		this.append(backSprite);
		const font = DynamicFontFactory.generateCommon(g.game, config.game_over.labels.main.size);
		const mainMessageLabel = this.getMessageLabel("GAME CLEAR!!!", font);
		this.append(mainMessageLabel);
		const subMessageLabel = new g.Label({
			scene: this,
			text: "体験版はここまでです。続きは製品版で。",
			font,
			fontSize: config.game_over.labels.sub.size,
			textColor: "black",
			x: config.game_over.labels.sub.x,
			y: config.game_over.labels.sub.y,
			textAlign: g.TextAlign.Center
		});
		this.append(subMessageLabel);
		const continueSprite = SpriteRepository.instance.generate("continue", this);
		continueSprite.pointUp.add(() => {
			window.open("http://derarara.com", "_blank");
		});
		this.append(continueSprite);
		const titleButton = this.getTitleButton();
		titleButton.registerSpriteGroup(this);
	}

	private viewForLoser(): void {
		const backSprite = SpriteRepository.instance.generate("back_lose", this);
		this.append(backSprite);
		const font = DynamicFontFactory.generateCommon(g.game, config.game_over.labels.main.size);
		const mainMessageLabel = this.getMessageLabel("GAME OVER...", font);
		this.append(mainMessageLabel);
		const titleButton = this.getTitleButton();
		titleButton.registerSpriteGroup(this);
	}

	private getMessageLabel(text: string, font: g.Font) {
		return new g.Label({
			scene: this,
			text,
			font,
			fontSize: font.size,
			textColor: "black",
			x: config.game_over.labels.main.x,
			y: config.game_over.labels.main.y,
			textAlign: g.TextAlign.Center
		});
	}

	private getTitleButton(): GameButtonModel {
		const titleButton = GameButtonModelFactory.instance.generate(
			this,
			[],
			config.game_over.buttons.return_title.x,
			config.game_over.buttons.return_title.y,
			["最初から"],
			false,
			config.game_over.buttons.return_title.width,
			config.game_over.buttons.return_title.height,
			config.game_over.buttons.return_title.font_size
		);
		titleButton.rect.pointUp.add(() => {
			setTargetScene("title");
		});
		return titleButton;
	}
}
