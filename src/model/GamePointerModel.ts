import {GameLifeObjectModel} from "./GameLifeObjectModel";
import {GameObjectOnFiledInterface} from "./GameObjectOnFiledInterface";

export class GamePointerModel implements GameObjectOnFiledInterface {
	sprite: g.FrameSprite = undefined;
	target: GameLifeObjectModel|null = null;
	absolutePlace: g.CommonOffset;

	get relationalPlace(): g.CommonOffset {
		return {
			x: this.sprite ? this.sprite.x : NaN,
			y: this.sprite ? this.sprite.y : NaN
		};
	}

	move() {
		if (this.target != null && false === this.target.isAlive()) {
			this.target = null;
		}
		if (this.target != null) {
			this.sprite.x = this.target.sprite.x;
			this.sprite.y = this.target.sprite.y;
		}
	}

	registerSprite(scene: g.Scene, sprite: g.FrameSprite, x: number, y: number) {
		if (this.sprite !== undefined) {
			scene.remove(this.sprite);
		}
		this.sprite = sprite;
		this.sprite.x = x;
		this.sprite.y = y;
		scene.append(this.sprite);
		this.sprite.start();
	}

	unregisterSprite(scene: g.Scene) {
		scene.remove(this.sprite);
		this.sprite = undefined;
	}

	moveRelationalPlace(dx: number, dy: number): void {
		if (this.sprite === undefined) {
			return;
		}
		this.sprite.x += dx;
		this.sprite.y += dy;
		this.sprite.modified();
	}
}
