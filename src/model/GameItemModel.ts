import {GameItemType} from "../type/GameItemType";
import {GameCharacterModel} from "./GameCharacterModel";
import {GameObjectOnFiledInterface} from "./GameObjectOnFiledInterface";

export interface GameItemModelParameter {
	id: number;
	name: string;
	imageId: string;
	money?: number;
	recover?: number;
	attack?: number;
	defense?: number;
	speed?: number;
	motivation?: number;
	itemType: GameItemType;
	sprite: g.Sprite;
	absolutePlace: g.CommonOffset;
}

export class GameItemModel implements GameObjectOnFiledInterface {
	absolutePlace: g.CommonOffset;
	private _id: number;
	private _name: string;
	private _imageId: string;
	private _itemType: GameItemType;
	private _sprite: g.Sprite;
	private _money: number|null;
	private _recover: number|null;
	private _attack: number|null;
	private _defense: number|null;
	private _speed: number|null;
	private _motivation: number|null;
	constructor(param: GameItemModelParameter) {
		this.absolutePlace = param.absolutePlace;
		this._id = param.id;
		this._name = param.name;
		this._imageId = param.imageId;
		this._itemType = param.itemType;
		this._sprite = param.sprite;
		this._money = param.money || null;
		this._recover = param.recover || null;
		this._attack = param.attack || null;
		this._defense = param.defense || null;
		this._speed = param.speed || null;
		this._motivation = param.motivation || null;
	}

	get imageId(): string {
		return this._imageId;
	}

	get sprite() {
		return this._sprite;
	}

	get money(): number {
		return this._money || 0;
	}

	get recover(): number {
		return this._recover || 0;
	}

	get motivation() {
		return this._motivation;
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

	get itemType() {
		return this._itemType;
	}

	get relationalPlace(): g.CommonOffset {
		return {
			x: this.sprite.x,
			y: this.sprite.y
		};
	}

	isCollision(characterModel: GameCharacterModel): boolean {
		return this.sprite.visible() && g.Collision.intersectAreas(this.sprite, characterModel.sprite);
	}

	deleteSprite(scene: g.Scene): void {
		this.sprite.hide();
		scene.remove(this.sprite);
	}

	moveRelationalPlace(dx: number, dy: number): void {
		this._sprite.x += dx;
		this._sprite.y += dy;
		this.sprite.modified();
	}

	getStatusLabelText(): string {
		let detail = "";
		switch (this._itemType) {
			case "recover":
				detail = `${this.recover}回復`;
				break;
			case "money":
				detail = `金${this.money}`;
				break;
			case "power-up":
				detail = `攻:+${this.attack} 防:+${this.defense} 速:+${this.speed}`;
				break;
		}
		return `${detail}`;
	}
}
