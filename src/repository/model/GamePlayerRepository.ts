import {GamePlayerModel} from "../../model/GamePlayerModel";
import {GamePlayerStateType} from "../../type/GamePlayerStateType";
import {GameTeamType} from "../../type/GameTeamType";

g.game.vars.players = {};

export const getPlayer = (playerId: string): GamePlayerModel|null => {
	const player = g.game.vars.players[playerId];
	return player != null && player instanceof GamePlayerModel ? player : null;
};

export const addPlayer = (model: GamePlayerModel): void => {
	g.game.vars.players[model.id] = model;
};

export const deletePlayer = (playerId: string): void => {
	delete g.game.vars.players[playerId];
};

export const getPlayerInField = (stageId: number, playerId: string): GamePlayerModel|null => {
	const player = getPlayer(playerId);
	return player != null && player.stageId === stageId && player.state === "play" ? player : null;
};

export const getSameTeamPlayersInField = (stageId: number, team: GameTeamType): GamePlayerModel[] => {
	const players: GamePlayerModel[] = [];
	Object.keys(g.game.vars.players).forEach(id => {
		const player = g.game.vars.players[id];
		if (player.team === team && player.stageId === stageId && player.state === "play") {
			players.push(player);
		}
	});
	return players;
};

export const addPlayersIntoStage = (stageId: number): void => {
	Object.keys(g.game.vars.players).forEach(id => {
		const player = g.game.vars.players[id];
		if (player.stageId === stageId && player.state === "join") {
			player.setState("play");
		}
	});
};

export const removePlayersFromStage = (stageId: number): void => {
	Object.keys(g.game.vars.players).forEach(id => {
		const player = g.game.vars.players[id];
		if (player.stageId === stageId && player.state === "play") {
			player.setState("none");
			player.setStageId(null);
			player.setTeam(null); // チーム登録削除はここでやるべきか
		}
	});
};
