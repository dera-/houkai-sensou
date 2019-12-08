import {GameCharacterModel} from "./GameCharacterModel";
import {GameTeamType} from "../type/GameTeamType";
import {GamePlayerStateType} from "../type/GamePlayerStateType";
import {GameLifeObjectModel} from "./GameLifeObjectModel";

export interface GamePlayerParameter {
	id: string;
	state: GamePlayerStateType;
	camera: g.Camera2D;
	money: number;
	team?: GameTeamType;
	stageId?: number;
}

export class GamePlayerModel {
	private _id: string;
	private _state: GamePlayerStateType;
	private _camera: g.Camera2D;
	private _money: number;
	private _team: GameTeamType|null;
	private _stageId: number|null;
	constructor(param: GamePlayerParameter) {
		this._id = param.id;
		this._state = param.state;
		this._camera = param.camera;
		this._money = param.money;
		this._team = param.team || null;
		this._stageId = param.stageId || null;
	}

	get id() {
		return this._id;
	}

	get state() {
		return this._state;
	}

	get camera() {
		return this._camera;
	}

	get money() {
		return this._money;
	}

	get team() {
		return this._team;
	}

	get stageId() {
		return this._stageId;
	}

	setState(value: GamePlayerStateType): void {
		this._state = value;
	}

	setTeam(team: GameTeamType|null): void {
		this._team = team;
	}

	setStageId(stageId: number|null): void {
		this._stageId = stageId;
	}

	canBuy(model: GameLifeObjectModel) {
		return this.money >= model.cost;
	}

	buy(model: GameLifeObjectModel) {
		model.changeAffiliation(this.team);
		this._money -= model.cost;
	}

	addMoney(money: number) {
		this._money += money;
	}
}
