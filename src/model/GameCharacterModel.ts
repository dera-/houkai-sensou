import {config} from "../config/config";
import {GameAnimationType} from "../type/GameAnimationType";
import {FrameSpriteRepository} from "../repository/FrameSpriteRepository";
import {GameLifeObjectModel} from "./GameLifeObjectModel";
import {GameTeamType, teamNameMap} from "../type/GameTeamType";
import {BuffParameter} from "./GameBuildingModel";
import {GameCharacterPersonalityType} from "../type/GameCharacterPersonalityType";
import {GameObjectOnFiledInterface} from "./GameObjectOnFiledInterface";

const MAX_MOTIVATION_SCORE = 100;

export interface GameCharacterModelParameter {
	id: number;
	name: string;
	imageId: string;
	maxHp: number;
	cost: number;
	attack: number;
	defense: number;
	speed: number;
	absolutePlace: g.CommonOffset;
	sprite: g.FrameSprite;
	affiliation?: GameTeamType;
	playerId?: string;
	personality?: GameCharacterPersonalityType;
}

export class GameCharacterModel extends GameLifeObjectModel {
	private _id: number;
	private _name: string;
	private _imageId: string;
	private _attack: number;
	private _defense: number;
	private _speed: number;
	private motivation: number;
	private targetGameObject: GameLifeObjectModel | null;
	private rigorFlag: boolean;
	private _buffs: {[id: string]: BuffParameter};
	private _totalBuff: BuffParameter;
	private _effectSprite: g.FrameSprite;
	private _personality: GameCharacterPersonalityType;
	private _goal: GameObjectOnFiledInterface;

	constructor(param: GameCharacterModelParameter) {
		super({
			sprite: param.sprite,
			hp: param.maxHp,
			absolutePlace: param.absolutePlace,
			affiliation: param.affiliation,
			playerId: param.playerId,
			cost: param.cost,
			lifeId: `character_${param.id}`
		});
		this._id = param.id;
		this._name = param.name;
		this._imageId = param.imageId;
		this._attack = param.attack;
		this._defense = param.defense;
		this._speed = param.speed;
		this.motivation = 0;
		this.targetGameObject = null;
		this.rigorFlag = false;
		this._buffs = {};
		this._totalBuff = {attack: 0, defense: 0, speed: 0};
		this._personality = param.personality || (this.affiliation === null ? "runaway" : "normal");
	}

	get id(): number {
		return this._id;
	}

	get imageId(): string {
		return this._imageId;
	}

	get attack(): number {
		return this._attack + this._totalBuff.attack;
	}

	get defense(): number {
		return this._defense + this._totalBuff.defense;
	}

	get speed(): number {
		return this._speed + this._totalBuff.speed;
	}

	get spriteFrame(): g.FrameSprite {
		return this.sprite as g.FrameSprite;
	}

	get personality(): GameCharacterPersonalityType {
		return this._personality;
	}

	get goal(): GameObjectOnFiledInterface|undefined {
		return this._goal;
	}

	set goal(obj: GameObjectOnFiledInterface|undefined) {
		this._goal = obj;
	}

	addBuff(id: string, buff: BuffParameter): void {
		if (this._buffs[id]) {
			this._totalBuff.attack -= this._buffs[id].attack;
			this._totalBuff.defense -= this._buffs[id].defense;
			this._totalBuff.speed -= this._buffs[id].speed;
		}
		this._totalBuff.attack += buff.attack;
		this._totalBuff.defense += buff.defense;
		this._totalBuff.speed += buff.speed;
		this._buffs[id] = buff;
	}

	removeBuff(id: string): void {
		if (this._buffs[id]) {
			this._totalBuff.attack -= this._buffs[id].attack;
			this._totalBuff.defense -= this._buffs[id].defense;
			this._totalBuff.speed -= this._buffs[id].speed;
		}
		delete this._buffs[id];
	}

	canMove(): boolean {
		return false === this.rigorFlag;
	}

	powerUp(attack: number, defense: number, speed: number) {
		this._attack += attack;
		this._defense += defense;
		this._speed += speed;
	}

	motivationUP(motivation: number) {
		this.motivation += motivation;
		if (this.motivation > MAX_MOTIVATION_SCORE) {
			this.motivation = MAX_MOTIVATION_SCORE;
		}
	}

	// @override
	isHit(x: number, y: number): boolean {
		// キャラスプライトが小さいので基底のレンジよりも広くしている
		return this.sprite.x - 0.4 * this.sprite.width <= x
			&& x <= this.sprite.x + 1.4 * this.sprite.width
			&& this.sprite.y - 0.4 * this.sprite.height <= y
			&& y <= this.sprite.y + 1.4 * this.sprite.height;
	}

	get attackTarget() {
		// TODO getの中でsetする副作用がある非常にいけない感じなので、落ち着いたら直す
		if (false === this.targetGameObject.isAlive() || this.affiliation === this.targetGameObject.affiliation) {
			this.targetGameObject = null;
		}
		return this.targetGameObject;
	}

	set attackTarget(gameObject: GameLifeObjectModel | null) {
		this.targetGameObject = gameObject;
	}

	canAttack() {
		if (this.rigorFlag) {
			return false;
		}
		return this.isAttackRangeToTarget();
	}

	isAttackRangeToTarget() {
		if (this.targetGameObject === null) {
			return false;
		}
		return this.isAttackRange(this.targetGameObject);
	}

	isAttackRange(target: GameLifeObjectModel, rate: number = 1) {
		const x = this.sprite.x + this.sprite.width / 2;
		const y = this.sprite.y + this.sprite.height / 2;
		const targetX = target.sprite.x + target.sprite.width / 2;
		const targetY = target.sprite.y + target.sprite.height / 2;
		const distance = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
		const spriteRadius = Math.sqrt(Math.pow(this.sprite.width, 2) + Math.pow(this.sprite.height, 2)) / 2;
		const targetSpriteRadius = Math.sqrt(Math.pow(target.sprite.width, 2) + Math.pow(target.sprite.height, 2)) / 2;
		const bias = (spriteRadius + targetSpriteRadius) / 2;
		// TODO: 職業毎にレンジが変わるようにしたい
		// @HACK ドット絵のサイズを考慮した距離を正確に出したい
		return config.game.character.default_attack_range.min <= distance
			&& distance <= rate * (config.game.character.default_attack_range.max + bias);
	}

	// @override
	registerSpriteGroup(scene: g.Scene) {
		super.registerSpriteGroup(scene);
		this.spriteFrame.start();
	}

	getSpriteNextStatus(targetX: number, targetY: number, future: number = 1): g.CommonArea {
		const currentX: number = this.sprite.x;
		const currentY: number = this.sprite.y;
		const radian = Math.atan2(targetY - currentY, targetX - currentX);
		return {
			x: this.sprite.x + future * Math.cos(radian) * this.getSpeedInField(),
			y: this.sprite.y + future * Math.sin(radian) * this.getSpeedInField(),
			width: this.sprite.width,
			height: this.sprite.height
		};
	}

	moveAnimation(targetX: number, targetY: number) {
		const currentX: number = this.sprite.x;
		const currentY: number = this.sprite.y;
		const radian = Math.atan2(targetY - currentY, targetX - currentX);
		const dx = Math.cos(radian);
		const dy = Math.sin(radian);
		let frames: number[] = this.spriteFrame.frames;

		if (dx > 0) {
			if (dy > 0) {
				frames = GameCharacterModel.RIGHT_DOWN_MOVING;
			} else if (dy < 0) {
				frames = GameCharacterModel.RIGHT_UP_MOVING;
			} else {
				frames = GameCharacterModel.RIGHT_MOVING;
			}
		} else if (dx < 0) {
			if (dy > 0) {
				frames = GameCharacterModel.LEFT_DOWN_MOVING;
			} else if (dy < 0) {
				frames = GameCharacterModel.LEFT_UP_MOVING;
			} else {
				frames = GameCharacterModel.LEFT_MOVING;
			}
		} else {
			if (dy > 0) {
				frames = GameCharacterModel.DOWN_MOVING;
			} else {
				frames = GameCharacterModel.UP_MOVING;
			}
		}
		if (this.spriteFrame.frames !== frames) {
			this.spriteFrame.frames = frames;
		}
		this.move(dx * this.getSpeedInField(), dy * this.getSpeedInField());
	}

	winPose(scene: g.Scene) {
		const beforeAction = this.spriteFrame.frames;
		this.spriteFrame.frames = GameCharacterModel.WIN_POSE;
		this.spriteFrame.interval = config.game.character.interval.win;
		this.sprite.modified();
		scene.setTimeout(() => {
			this.spriteFrame.frames = beforeAction;
			this.spriteFrame.interval = config.game.character.interval.normal;
			this.sprite.modified();
		}, config.game.character.rigid_time.win, this);
	}

	attackAction(scene: g.Scene) {
		const beforeAction = this.spriteFrame.frames;
		const x = this.sprite.x + this.sprite.width / 2;
		const y = this.sprite.y + this.sprite.height / 2;
		const targetX = this.targetGameObject.sprite.x + this.targetGameObject.sprite.width / 2;
		const targetY = this.targetGameObject.sprite.y + this.targetGameObject.sprite.height / 2;
		const angle = Math.atan2(targetY - y, targetX - x) / Math.PI * 180;
		// TODO: 職業ごとにエフェクトが変わるようにしたい
		this._effectSprite = FrameSpriteRepository.instance.generate("DefaultBattleEffect", scene);
		this._effectSprite.x = targetX - this._effectSprite.width / 2;
		this._effectSprite.y = targetY - this._effectSprite.height / 2;
		this._effectSprite.start();
		this.spriteFrame.frames = GameCharacterModel.ATTACK;
		this.spriteFrame.interval = config.game.character.interval.attack;
		if (-90 < angle && angle < 90) {
			this.sprite.scaleX = -1;
		}
		scene.append(this._effectSprite);

		this.rigorFlag = true;
		scene.setTimeout(() => {
			this.rigorFlag = false;
			this.spriteFrame.frames = beforeAction;
			this.sprite.scaleX = 1;
			this.spriteFrame.interval = config.game.character.interval.normal;
			scene.remove(this._effectSprite);
		}, config.game.character.rigid_time.battle, this);
	}

	damageAction(scene: g.Scene) {
		const beforeAction = this.spriteFrame.frames;
		if (beforeAction === GameCharacterModel.DAMAGE) {
			return;
		}
		this.spriteFrame.frames = GameCharacterModel.DAMAGE;
		this.spriteFrame.interval = config.game.character.interval.damage;

		scene.setTimeout(() => {
			this.spriteFrame.frames = beforeAction;
			this.spriteFrame.interval = config.game.character.interval.normal;
		}, config.game.character.rigid_time.battle, this);
	}

	deadAction(scene: g.Scene, cb?: () => void) {
		this.aliveStatus = GameLifeObjectModel.SPRITE_GOING_TO_DEAD;
		this.spriteFrame.frames = GameCharacterModel.DEAD;
		scene.setTimeout(() => {
			this.aliveStatus = GameLifeObjectModel.SPRITE_DEAD;
			this.unregisterSpriteGroup(scene);
			if (cb) {
				cb();
			}
		}, config.game.character.rigid_time.dead, this);
	}

	moveRelationalPlace(dx: number, dy: number): void {
		super.moveRelationalPlace(dx, dy);
		if (this._effectSprite != null) {
			this._effectSprite.x += dx;
			this._effectSprite.y += dy;
			this._effectSprite.modified();
		}
	}

	getStatusLabelText(): string {
		const affiliationStr = this.affiliation === null ? "なし" : teamNameMap[this.affiliation];
		return `[${affiliationStr}] HP:${this.currentHp}/${this.maxHp} 攻:${this.attack} 守:${this.defense} 速:${this.speed}`;
	}

	getPowerUpText(attack: number, defense: number, speed: number): string {
		return `攻:${attack}UP 守:${defense}UP 速:${speed}UP `;
	}

	getRecoverText(recover: number): string {
		return `HP${recover}回復 (${this.currentHp}/${this.maxHp})`;
	}

	private getSpeedInField() {
		return Math.pow(this.speed / config.game.character.standard_speed, 0.5);
	}
}

export namespace GameCharacterModel {
	// 以下、アニメーションパターン
	// TODO クラス分け
	export const RIGHT_MOVING = [7, 8, 7, 6];
	export const LEFT_MOVING = [4, 5, 4, 3];
	export const UP_MOVING = [10, 11, 10, 9];
	export const DOWN_MOVING = [1, 2, 1, 0];
	export const LEFT_DOWN_MOVING = [13, 14, 13, 12];
	export const LEFT_UP_MOVING = [16, 17, 16, 15];
	export const RIGHT_DOWN_MOVING = [19, 20, 19, 18];
	export const RIGHT_UP_MOVING = [22, 23, 22, 21];
	export const ATTACK = [25, 26, 25, 24];
	export const DAMAGE = [39, 39, 40, 40];
	export const DEAD = [57, 57, 58, 58, 59, 59];
	export const WIN_POSE = [48, 49, 50];

	export const getAnimation = (key: GameAnimationType) => {
		switch (key) {
			case "moving_right":
				return RIGHT_MOVING;
			case "moving_right_up":
				return RIGHT_UP_MOVING;
			case "moving_right_down":
				return RIGHT_DOWN_MOVING;
			case "moving_left":
				return LEFT_MOVING;
			case "moving_left_up":
				return LEFT_UP_MOVING;
			case "moving_left_down":
				return LEFT_DOWN_MOVING;
			case "moving_up":
				return UP_MOVING;
			case "moving_down":
				return DOWN_MOVING;
		}
	}
}
