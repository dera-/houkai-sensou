import {GameBuildingType} from "../type/GameBuildingType";
import {config} from "../config/config";
import {FrameSpriteRepository} from "../repository/FrameSpriteRepository";
import {GameLifeObjectModel} from "./GameLifeObjectModel";
import {GameTeamType, teamNameMap} from "../type/GameTeamType";
import {getPlayer} from "../repository/model/GamePlayerRepository";

export interface BuffParameter {
	attack: number;
	defense: number;
	speed: number;
}

export interface GameBuildingModelParameter {
	id: number;
	name: string;
	imageId: string;
	maxHp: number;
	money?: number;
	recover?: number;
	attack?: number;
	defense?: number;
	speed?: number;
	cost?: number;
	buildingType: GameBuildingType;
	sprite: g.Sprite;
	absolutePlace: g.CommonOffset;
	affiliation?: GameTeamType;
	playerId?: string;
}

export class GameBuildingModel extends GameLifeObjectModel {
	private _id: number;
	private _name: string;
	private _imageId: string;
	private _buildingType: GameBuildingType;
	private _money: number|null;
	private _recover: number|null;
	private _attack: number|null;
	private _defense: number|null;
	private _speed: number|null;
	private _breakEffectSprite: g.FrameSprite;

	constructor(param: GameBuildingModelParameter) {
		super({
			sprite: param.sprite,
			hp: param.maxHp,
			absolutePlace: param.absolutePlace,
			affiliation: param.affiliation,
			playerId: param.playerId,
			cost: param.cost,
			lifeId: `building_${param.id}`
		});
		this._id = param.id;
		this._name = param.name;
		this._imageId = param.imageId;
		this._buildingType = param.buildingType;
		this._money = param.money || null;
		this._recover = param.recover || null;
		this._attack = param.attack || null;
		this._defense = param.defense || null;
		this._speed = param.speed || null;
	}

	get id() {
		return this._id;
	}

	get imageId(): string {
		return this._imageId;
	}

	get attack(): number {
		return this._attack || 0;
	}

	get defense(): number {
		return this._defense || 0;
	}

	get speed(): number {
		return this._speed || 0;
	}

	get buf(): BuffParameter {
		return {
			attack: this.attack,
			defense: this.defense,
			speed: this.speed
		};
	}

	get buildingType(): GameBuildingType {
		return this._buildingType;
	}

	isBase() {
		return this._buildingType === "base";
	}

	breakEffect(scene: g.Scene, cb: () => void) {
		this.aliveStatus = GameLifeObjectModel.SPRITE_GOING_TO_DEAD;
		this._breakEffectSprite = FrameSpriteRepository.instance.generate("ExplodeImg", scene);
		this._breakEffectSprite.x = this.sprite.x + this.sprite.width / 2 - this._breakEffectSprite.width / 2;
		this._breakEffectSprite.y = this.sprite.y + this.sprite.height / 2 - this._breakEffectSprite.height / 2;
		this._breakEffectSprite.start();
		scene.append(this._breakEffectSprite);
		scene.setTimeout(
			() => {
				this.aliveStatus = GameLifeObjectModel.SPRITE_DEAD;
				scene.remove(this._breakEffectSprite);
				this.unregisterSpriteGroup(scene);
				if (cb) {
					cb();
				}
			},
			config.game.character.rigid_time.dead, this
		);
	}

	unregisterSpriteGroup(scene: g.Scene) {
		super.unregisterSpriteGroup(scene);
		this.sprite.hide();
	}

	moveRelationalPlace(dx: number, dy: number): void {
		super.moveRelationalPlace(dx, dy);
		if (this._breakEffectSprite != null) {
			this._breakEffectSprite.x += dx;
			this._breakEffectSprite.y += dy;
			this._breakEffectSprite.modified();
		}
	}

	getStatusLabelText(): string {
		const affiliationStr = this.affiliation === null ? "無所属" : teamNameMap[this.affiliation];
		let detail = "";
		switch (this._buildingType) {
			case "base":
				detail = "本拠地,";
				detail += (getPlayer(g.game.selfId).team === this.affiliation ? "破壊されたら敗北" : "破壊したら勝利");
				break;
			case "power-up":
				detail = `強化(攻:+${this.attack} 防:+${this.defense} 速:+${this.speed})`;
				break;
			case "power-down":
				detail = `弱体化(攻:${this.attack} 防:${this.defense} 速:${this.speed})`;
				break;
			case "wall":
				detail = "ただの障害物";
				break;
		}
		return `[${affiliationStr}] ${detail}`;
	}
}
