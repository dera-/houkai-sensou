import {SpriteRepository} from "../repository/SpriteRepository";
import {config} from "../config/config";
import {DynamicFontFactory} from "../factory/DynamicFontFactory";
import {isUndefined} from "util";

export class GameCostView {
	private targetSprite: g.Sprite;
	private cost: number;
	private upperViewer: g.Sprite = undefined;
	private downerViewer: g.Sprite = undefined;
	private currentViewer: g.Sprite = undefined;
	private costLabel: g.Label = undefined;

	constructor(sprite: g.Sprite, cost: number) {
		this.targetSprite = sprite;
		this.cost = cost;
	}

	registerSpriteGroup(scene: g.Scene, targetCameras: g.Camera2D[] = []): void {
		this.setCurrentViewer(scene, targetCameras);
		scene.append(this.currentViewer);
		const font = DynamicFontFactory.generateCommon(g.game, 12);
		const costStr = this.cost === Infinity ? "不可能" : `${this.cost}`;
		this.costLabel = new g.Label({
			scene,
			text: `cost:${costStr}`,
			font,
			fontSize: font.size,
			textColor: "black",
			targetCameras
		});
		this.costLabel.x = this.currentViewer.x + 0.05 * this.currentViewer.width;
		this.costLabel.y = this.currentViewer.y + 0.2 * this.currentViewer.height;
		scene.append(this.costLabel);
	}

	unregisterSpriteGroup(scene: g.Scene): void {
		scene.remove(this.costLabel);
		scene.remove(this.currentViewer);
		this.costLabel = undefined;
		this.currentViewer = undefined;
	}

	show(): void {
		if (this.costLabel !== undefined) {
			this.costLabel.show();
		}
		if (this.currentViewer !== undefined) {
			this.currentViewer.show();
		}
	}

	hide(): void {
		if (this.costLabel !== undefined) {
			this.costLabel.hide();
		}
		if (this.currentViewer !== undefined) {
			this.currentViewer.hide();
		}
	}

	move(dx: number, dy: number) {
		if (this.costLabel !== undefined) {
			this.costLabel.x += dx;
			this.costLabel.y += dy;
			this.costLabel.invalidate();
		}
		if (this.currentViewer !== undefined) {
			this.currentViewer.x += dx;
			this.currentViewer.y += dy;
			this.currentViewer.modified();
		}
	}

	private setCurrentViewer(scene: g.Scene, targetCameras: g.Camera2D[]): void {
		const viewerX = this.targetSprite.x + this.targetSprite.width / 2 - config.game.cost_viewer.width / 2;
		if (this.targetSprite.y - config.game.cost_viewer.height < 0) {
			if (!this.downerViewer) {
				this.downerViewer = SpriteRepository.instance.generate("costViewerDown", scene, targetCameras);
			}
			this.currentViewer = this.downerViewer;
			this.currentViewer.x = viewerX;
			this.currentViewer.y = this.targetSprite.y + this.targetSprite.height;
		} else {
			if (!this.upperViewer) {
				this.upperViewer = SpriteRepository.instance.generate("costViewerUp", scene, targetCameras);
			}
			this.currentViewer = this.upperViewer;
			this.currentViewer.x = viewerX;
			this.currentViewer.y = this.targetSprite.y - config.game.cost_viewer.height;
		}
	}
}
