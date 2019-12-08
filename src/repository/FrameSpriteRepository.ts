export interface FrameSpriteParameter {
	assetId: string;
	width: number;
	height: number;
	srcWidth: number;
	srcHeight: number;
	frames?: number[];
	frameNumber?: number;
	interval?: number;
	touchable?: boolean;
	x?: number;
	y?: number;
	srcX?: number;
	srcY?: number;
}

export class FrameSpriteRepository {
	private static _instance: FrameSpriteRepository;
	private frameSpriteParameters: {[key: string]: FrameSpriteParameter};

	private constructor() {
		this.frameSpriteParameters = {};
	}

	public static get instance(): FrameSpriteRepository {
		if (!this._instance) {
			this._instance = new FrameSpriteRepository();
		}
		return this._instance;
	}

	get(id: string) {
		return this.frameSpriteParameters[id];
	}

	register(id: string, parameter: FrameSpriteParameter) {
		this.frameSpriteParameters[id] = parameter;
	}

	generate(id: string, scene: g.Scene, targetCameras: g.Camera2D[] = []): g.FrameSprite {
		const parameter: FrameSpriteParameter = this.frameSpriteParameters[id];
		return new g.FrameSprite({
			scene: scene,
			src: scene.assets[parameter.assetId] as g.ImageAsset,
			width: parameter.width,
			height: parameter.height,
			srcWidth: parameter.srcWidth,
			srcHeight: parameter.srcHeight,
			frames: parameter.frames,
			frameNumber: parameter.frameNumber,
			interval: parameter.interval,
			touchable: parameter.touchable,
			x: parameter.x,
			y: parameter.y,
			targetCameras: targetCameras
		});
	}
}
