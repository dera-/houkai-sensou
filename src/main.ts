import {GameTitleScene} from "./scene/GameTitleScene";
import {preLoad} from "./util/PreLoad";
import {config} from "./config/config";
import {addScene} from "./repository/SceneRepository";

export = (param: g.GameMainParameterObject): void => {
	preLoad();
	const scene: GameTitleScene = new GameTitleScene({game: g.game, assetIds: config.title.asset_ids});
	addScene(scene);
};
