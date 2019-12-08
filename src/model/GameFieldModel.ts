import {Tile} from "@akashic-extension/akashic-tile";
import {config} from "../config/config";

export interface GameFieldModelParameter {
	tile: Tile; // めちゃめちゃ手抜き
	viewPoint: g.CommonOffset;
}

export class GameFieldModel {
	private _tile: Tile;
	private _viewPoint: g.CommonOffset;

	constructor(param: GameFieldModelParameter) {
		this._tile = param.tile;
		this._viewPoint = param.viewPoint;
	}

	get tile() {
		return this._tile;
	}

	get viewPoint() {
		return this._viewPoint;
	}

	moveViewPoint(dx: number, dy: number) {
		const afterX = this.viewPoint.x + dx;
		const afterY = this.viewPoint.y + dy;
		if (0 <= afterX && afterX + g.game.width <= this.tile.width) {
			this._tile.x -= dx;
			this._viewPoint.x = afterX;
		}
		// ステータス画面の高さも考慮する
		if (0 <= afterY && afterY + g.game.height <= this.tile.height + config.game.option_space.height) {
			this._tile.y -= dy;
			this._viewPoint.y = afterY;
		}
		this.tile.invalidate();
	}
}
