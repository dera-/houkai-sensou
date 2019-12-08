import {GamePlayerModel, GamePlayerParameter} from "../../model/GamePlayerModel";
import {GameTeamType, teamNameMap} from "../../type/GameTeamType";
import {addPlayer, addPlayersIntoStage, deletePlayer, getPlayer} from "../../repository/model/GamePlayerRepository";
import {GameButtonModel} from "../../model/GameButtonModel";
import {config} from "../../config/config";
import {GameFieldScene} from "../GameFieldScene";
import {addScene} from "../../repository/SceneRepository";

export interface GameTitleSceneEventParameter {
	scene: g.Scene;
	teams: {[key: string]: GamePlayerModel[]};
	teamButtons: {[key: string]: GameButtonModel};
	currentStateLabel: g.Label;
	stageId: number;
}

export class GameTitleSceneEvent {
	private parameter: GameTitleSceneEventParameter;
	constructor(parameter: GameTitleSceneEventParameter) {
		this.parameter = parameter;
	}

	addMemberEventOnPushedButton(team: GameTeamType) {
		const event = (ev: any): void => {
			const playerId = ev.player.id;
			const playerModel = getPlayer(playerId);
			playerModel.setTeam(team);
			playerModel.setState("join");
			playerModel.setStageId(this.parameter.stageId);
			this.parameter.teams[team].push(playerModel);
			this.changeButtonText(team);
			// 他の軍への参加ボタンを押せなくする(本当はボタン押したらフレキシブルに参加軍変えられるのが望ましいがちょっと面倒なので手抜き)
			Object.keys(this.parameter.teamButtons).forEach((t: string) => {
				this.parameter.teamButtons[t].rect.pointUp.removeAll();
				if (t as GameTeamType !== team) {
					this.parameter.teamButtons[t].removeDefaultEvent();
				}
			});
			this.parameter.teamButtons[team].rect.pointUp.add(this.deleteMemberEventOnPushedButton(team));
		};
		return event;
	}

	deleteMemberEventOnPushedButton(team: GameTeamType) {
		const event = (ev: any): void => {
			const playerId = ev.player.id;
			const playerModel = getPlayer(playerId);
			this.deleteMemberFromTeam(playerModel);
			this.changeButtonText(team);
			this.parameter.teamButtons[team].rect.pointUp.removeAll();
			// 他の軍参加ボタンが押せなくなっている状態なので押せるように直す
			Object.keys(this.parameter.teamButtons).forEach((t: string) => {
				this.parameter.teamButtons[t].rect.pointUp.add(this.addMemberEventOnPushedButton(t as GameTeamType));
				this.parameter.teamButtons[t].addDefaultEvent();
			});
		};
		return event;
	}

	joinGameEvent() {
		const event = (ev: any): void => {
			const playerId = ev.player.id;
			if (getPlayer(playerId) === null) {
				const camera = new g.Camera2D({ game: g.game });
				const playerParam: GamePlayerParameter = {
					id: playerId,
					state: "none",
					camera: camera,
					team: null,
					money: config.game.player.default_money,
					stageId: null
				};
				addPlayer(new GamePlayerModel(playerParam));
				if (playerId === g.game.selfId) {
					g.game.focusingCamera = camera;
				}
			}
		};
		return event;
	}

	leaveGameEvent() {
		const event = (ev: any): void => {
			const playerId = ev.player.id;
			if (playerId === g.game.selfId) {
				g.game.focusingCamera = undefined;
			}
			const playerModel = getPlayer(playerId);
			this.deleteMemberFromTeam(playerModel);
			deletePlayer(playerId);
		};
		return event;
	}

	currentStateEvent() {
		const event = (): void => {
			const beforeText = this.parameter.currentStateLabel.text;
			const player = getPlayer(g.game.selfId);
			if (player === null || player.state === "none") {
				this.parameter.currentStateLabel.text = "どの軍に参戦するか選択してください";
			} else if (!this.canStartGame()) {
				this.parameter.currentStateLabel.text = "参加者を待ちます。しばらくお待ちください";
			} else {
				this.parameter.currentStateLabel.text = "ゲームを開始します。少々お待ちください";
				this.parameter.scene.setTimeout(
					() => {
						if (!this.canStartGame()) {
							return;
						}
						this.startGame();
					},
					config.title.waiting_to_start,
					this
				);
			}
			if (beforeText !== this.parameter.currentStateLabel.text) {
				this.parameter.currentStateLabel.modified();
			}
		};
		return event;
	}

	private deleteMemberFromTeam(playerModel: GamePlayerModel): void {
		playerModel.setTeam(null);
		playerModel.setState("none");
		playerModel.setStageId(null);
		Object.keys(this.parameter.teams).forEach(team => {
			const members = this.parameter.teams[team].filter(member => member.id !== playerModel.id);
			this.parameter.teams[team] = members;
		});
	}

	private changeButtonText(team: GameTeamType): void {
		const memberCount = this.parameter.teams[team].length;
		const newText = `${teamNameMap[team]}: ${memberCount}名`;
		this.parameter.teamButtons[team].changeCurrentText(newText);
	}

	private canStartGame(): boolean {
		return !Object.keys(this.parameter.teams).some(name => this.parameter.teams[name].length < config.title.minimum_member_count);
	}

	private startGame(): void {
		addPlayersIntoStage(this.parameter.stageId);
		addScene(
			new GameFieldScene({game: g.game, assetIds: config.game.asset_ids}, this.parameter.stageId, "testArrangement")
		);
	}
}
