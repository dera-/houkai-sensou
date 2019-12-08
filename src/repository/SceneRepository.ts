import {GameSceneBase} from "../scene/GameSceneBase";
import {GameSceneType} from "../type/GameSceneType";
import {GameTitleForStandAloneScene} from "../scene/GameTitleForStandAloneScene";

const sceneStack: GameSceneBase[] = [];
let targetId: GameSceneType|undefined;

export const addScene = (scene: GameSceneBase): void => {
	sceneStack.unshift(scene);
	g.game.pushScene(scene);
};

export const moveScene = (): void => {
	if (targetId === undefined || sceneStack.length === 0) {
		return;
	}
	if (sceneStack[0].id === targetId) {
		targetId = undefined;
		return;
	}
	sceneStack.shift();
	if (sceneStack.length === 0) {
		g.game.replaceScene(new GameTitleForStandAloneScene({game: g.game}));
	} else {
		g.game.popScene();
	}
};

export const setTargetScene = (id: GameSceneType): void => {
	targetId = id;
};
