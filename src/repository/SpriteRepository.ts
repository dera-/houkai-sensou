export interface SpriteParameter {
	assetId: string;
	width: number;
	height: number;
	srcWidth?: number;
	srcHeight?: number;
	srcX?: number;
	srcY?: number;
	x?: number;
	y?: number;
	touchable?: boolean;
}

export class SpriteRepository {
	private static _instance: SpriteRepository;
	private spriteParameters: {[key: string]: SpriteParameter};

	private constructor() {
		this.spriteParameters = {};
	}

	public static get instance(): SpriteRepository {
		if (!this._instance) {
			this._instance = new SpriteRepository();
		}

		return this._instance;
	}

	register(id: string, parameter: SpriteParameter) {
		this.spriteParameters[id] = parameter;
	}

	generate(id: string, scene: g.Scene, targetCameras: g.Camera2D[] = []): g.Sprite {
		const parameter: SpriteParameter = this.spriteParameters[id];
		return new g.Sprite({
			scene: scene,
			src: scene.assets[parameter.assetId] as g.ImageAsset,
			width: parameter.width,
			height: parameter.height,
			srcWidth: parameter.srcWidth,
			srcHeight: parameter.srcHeight,
			srcX: parameter.srcX,
			srcY: parameter.srcY,
			x: parameter.x,
			y: parameter.y,
			touchable: parameter.touchable,
			targetCameras: targetCameras
		});
	}

}