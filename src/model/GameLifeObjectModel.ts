import {config} from "../config/config";
import {GameTeamType} from "../type/GameTeamType";
import {getPlayer} from "../repository/model/GamePlayerRepository";
import {GameObjectOnFiledInterface} from "./GameObjectOnFiledInterface";
import {GameCostView} from "./GameCostView";

export interface GameLifeObjectModelParameters {
	sprite: g.Sprite;
	hp: number;
	absolutePlace: g.CommonOffset;
	lifeId: string;
	cost?: number;
	affiliation?: GameTeamType;
	playerId?: string;
}

// HPを持つ物体の抽象クラス
export abstract class GameLifeObjectModel implements  GameObjectOnFiledInterface {
	absolutePlace: g.CommonOffset;
	readonly lifeId: string; // 苦し紛れに作ってしまった建物とキャラをまとめたID。あとでID周りも整理する
	protected currentHp: number;
	protected maxHp: number;
	protected hpBarRect: g.FilledRect = undefined;
	protected affiliationRect: g.FilledRect = undefined;
	protected aliveStatus: number;
	private _cost: number;

	private _sprite: g.Sprite;
	private _affiliation: GameTeamType|null; // このオブジェクトの所属
	private _playerId: string|null; // このオブジェクトを所有するプレイヤーのID
	private _costView: GameCostView;

	constructor(param: GameLifeObjectModelParameters) {
		this._sprite = param.sprite;
		this._affiliation = param.affiliation || null;
		this._playerId = param.playerId || null;
		this.currentHp = param.hp;
		this.maxHp = param.hp;
		this.aliveStatus = GameLifeObjectModel.SPRITE_ALIVE;
		this.absolutePlace = param.absolutePlace;
		this._cost = param.cost || Infinity;
		this._costView = new GameCostView(this.sprite, this.cost);
		this.lifeId = param.lifeId;
	}

	get sprite(): g.Sprite {
		return this._sprite;
	}

	get affiliation(): GameTeamType|null {
		return this._affiliation;
	}

	get playerId(): string|null {
		return this._playerId;
	}

	get cost(): number {
		return this._cost;
	}

	get relationalPlace(): g.CommonOffset {
		return {
			x: this.sprite.x,
			y: this.sprite.y
		};
	}

	get relationArea(): g.CommonArea {
		return {
			...this.relationalPlace,
			width: this.sprite.width,
			height: this.sprite.height
		};
	}

	isAlive() {
		return this.currentHp > 0;
	}

	// isAliveだと爆発中にtrueを返してしまって爆発エフェクトが大量に作られてしまうので用意したメソッド
	isDeading() {
		return this.aliveStatus !== GameLifeObjectModel.SPRITE_ALIVE;
	}

	isSameAffiliation(lifeObjectModel: GameLifeObjectModel) {
		return this.affiliation === lifeObjectModel.affiliation;
	}

	isHit(x: number, y: number): boolean {
		return this.sprite.x - 0.25 * this.sprite.width <= x
			&& x <= this.sprite.x + 1.25 * this.sprite.width
			&& this.sprite.y - 0.25 * this.sprite.height <= y
			&& y <= this.sprite.y + 1.25 * this.sprite.height;
	}

	damage(value: number) {
		this.changeHp(-1 * value);
	}

	recover(value: number) {
		this.changeHp(value);
	}

	registerSpriteGroup(scene: g.Scene) {
		if (this.hpBarRect === undefined) {
			this.hpBarRect = this.generateHpBarRect(scene);
		}
		scene.append(this.hpBarRect);
		if (this.affiliationRect === undefined) {
			this.affiliationRect = this.generateAffiliationRect(scene);
		}
		scene.append(this.affiliationRect);
		scene.append(this.sprite);

		this.registerCostView(scene, [getPlayer(g.game.selfId).camera]);
		this.showCostView(false);
	}

	unregisterSpriteGroup(scene: g.Scene) {
		scene.remove(this.sprite);
		scene.remove(this.affiliationRect);
		scene.remove(this.hpBarRect);
		this.unregisterCostView(scene);
	}

	changeAffiliation(affiliation: GameTeamType) {
		this._affiliation = affiliation;
		this.affiliationRect.cssColor = this.getAffiliationRectColor();
		this.affiliationRect.modified();
	}

	moveRelationalPlace(dx: number, dy: number): void {
		this._sprite.x += dx;
		this._sprite.y += dy;
		this.sprite.modified();

		this.affiliationRect.x += dx;
		this.affiliationRect.y += dy;
		this.affiliationRect.modified();

		this.hpBarRect.x += dx;
		this.hpBarRect.y += dy;
		this.hpBarRect.modified();

		this._costView.move(dx, dy);
	}

	showCostView(isShow: boolean) {
		if (isShow) {
			this._costView.show();
		} else {
			this._costView.hide();
		}
	}

	static isCollision(target: GameLifeObjectModel, status: g.CommonArea) {
		return target.isAlive()
			&& g.Collision.intersect(
				status.x,
				status.y,
				status.width,
				status.height,
				target.sprite.x,
				target.sprite.y,
				target.sprite.width,
				target.sprite.height
			);
	}

	protected move(dx: number, dy: number) {
		this.absolutePlace.x += dx;
		this.absolutePlace.y += dy;
		this.moveRelationalPlace(dx, dy);
	}

	private registerCostView(scene: g.Scene, targetCameras: g.Camera2D[] = []) {
		this._costView.registerSpriteGroup(scene, targetCameras);
	}

	private unregisterCostView(scene: g.Scene) {
		this._costView.unregisterSpriteGroup(scene);
	}

	private changeHp(value: number) {
		this.currentHp += value;
		if (this.currentHp > this.maxHp) {
			this.currentHp = this.maxHp;
		} else if (this.currentHp < 0) {
			this.currentHp = 0;
		}
		// HPバーの変動
		this.hpBarRect.width = this.sprite.width * this.currentHp / this.maxHp;
		this.hpBarRect.modified();
	}

	private generateAffiliationRect(scene: g.Scene) {
		return new g.FilledRect({
			scene: scene,
			x: this.sprite.x,
			y: this.sprite.y,
			width: this.sprite.width,
			height: this.sprite.height,
			cssColor: this.getAffiliationRectColor()
		});
	}

	private getAffiliationRectColor(): string {
		let colorStr: string;
		if (this.affiliation === null) {
			colorStr = config.game.character.affiliation_color.none;
		} else if (this.affiliation === getPlayer(g.game.selfId).team) {
			colorStr = config.game.character.affiliation_color.ally;
		} else {
			colorStr = config.game.character.affiliation_color.enemy;
		}
		return colorStr;
	}

	private generateHpBarRect(scene: g.Scene) {
		return new g.FilledRect({
			scene: scene,
			x: this.sprite.x,
			y: this.sprite.y + this.sprite.height,
			width: this.sprite.width,
			height: config.game.hp_bar.height,
			cssColor: "green" // TODO: 今は色固定だけど,残りHPによって色を変えられるようにする
		});
	}
}

export namespace GameLifeObjectModel {
	export const SPRITE_ALIVE = 0;
	export const SPRITE_GOING_TO_DEAD = 1;
	export const SPRITE_DEAD = 2;
}
