import {GamePlayerModel} from "../model/GamePlayerModel";
import {config} from "../config/config";
import {GameTeamType, teamNameMap} from "../type/GameTeamType";
import {DynamicFontFactory} from "../factory/DynamicFontFactory";
import {GameButtonModelFactory} from "../factory/model/GameButtonModelFactory";
import {GameTitleSceneEvent} from "./event/GameTitleSceneEvent";
import {GameButtonModel} from "../model/GameButtonModel";
import {GameSceneBase} from "./GameSceneBase";

const TEAMS: GameTeamType[] = ["red", "black"];
const defaultStageId = 1; // TODO: 複数ステージができるまでは一旦これで行く

export class GameTitleScene extends GameSceneBase {
	private eventHolder: GameTitleSceneEvent;
	private teams: {[key: string]: GamePlayerModel[]};
	private teamButtons: {[key: string]: GameButtonModel};
	private currentStateLabel: g.Label;

	constructor(param: g.SceneParameterObject) {
		super(param, "title");
		this.teams = {};
		this.teamButtons = {};
		this.initialize();
	}

	protected onLoaded(): void {
		let index = 0;
		TEAMS.forEach(team => {
			this.teams[team] = [];
			this.teamButtons[team] = GameButtonModelFactory.instance.generate(
				this,
				[],
				config.title.buttons.x_start + index * (config.title.buttons.width + config.title.buttons.x_interval),
				config.title.buttons.y_start,
				[teamNameMap[team] + ": 0名"],
				true,
				config.title.buttons.width,
				config.title.buttons.height
			);
			index++;
		});
		const font = DynamicFontFactory.generateCommon(g.game, 28);
		this.currentStateLabel = new g.Label({
			scene: this,
			text: "どの軍に参戦するか選択してください",
			font,
			fontSize: config.title.labels.current_status.size,
			textColor: "blue",
			x: config.title.labels.current_status.x | 0,
			y: config.title.labels.current_status.y | 0,
			textAlign: g.TextAlign.Center
		});
		this.eventHolder = new GameTitleSceneEvent({
			scene: this,
			teams: this.teams,
			teamButtons: this.teamButtons,
			currentStateLabel: this.currentStateLabel,
			stageId: defaultStageId
		});
		g.game.join.add(this.eventHolder.joinGameEvent());
		g.game.leave.add(this.eventHolder.leaveGameEvent());
		this.loaded.add(this.onLoaded, this);
		// TODO: 背景をなんか良さげな画像に変える
		const whiteBack = new g.FilledRect({
			scene: this,
			x: 0,
			y: 0,
			width: g.game.width,
			height: g.game.height,
			cssColor: "white"
		});
		this.append(whiteBack);
		const titleFont = DynamicFontFactory.generateCommon(g.game, config.title.labels.title.size);
		const titleLabel = new g.Label({
			scene: this,
			text: "崩壊戦争",
			font: titleFont,
			fontSize: titleFont.size,
			textColor: "black",
			x: config.title.labels.title.x | 0,
			y: config.title.labels.title.y | 0,
			textAlign: g.TextAlign.Center
		});
		this.append(titleLabel);
		this.append(this.currentStateLabel);
		Object.keys(this.teamButtons).forEach(team => {
			const button = this.teamButtons[team];
			button.rect.pointUp.add(this.eventHolder.addMemberEventOnPushedButton(team as GameTeamType));
			button.registerSpriteGroup(this);
		});
		this.update.add(this.eventHolder.currentStateEvent());
	}
}
