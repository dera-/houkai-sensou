import {preLoad} from "./util/PreLoad";
import {addScene} from "./repository/SceneRepository";
import {GameTitleForStandAloneScene} from "./scene/GameTitleForStandAloneScene";
import {config} from "./config/config";

export = (param: g.GameMainParameterObject): void => {
	preLoad();
	addScene(new GameTitleForStandAloneScene({game: g.game, assetIds: config.title.asset_ids}));
};
