import {moveScene} from "../repository/SceneRepository";
import {GameSceneType} from "../type/GameSceneType";

export abstract class GameSceneBase extends g.Scene {
	private _id: GameSceneType;

	constructor(param: g.SceneParameterObject, id: GameSceneType) {
		super(param);
		this._id = id;
	}

	get id() {
		return this._id;
	}

	protected initialize(): void {
		this.loaded.add(() => {
				this.update.add(() => {
					moveScene();
				});
			}
		);
		this.loaded.add(this.onLoaded, this);
	}

	protected abstract onLoaded(): void;
}
