export type GameTeamType = "origin"
	| "red"
	| "black"
	| "blue"
	| "green"
	| "ally"
	| "enemy";

export const teamNameMap: {[key: string]: string} = {
	origin: "オリジン軍",
	red: "赤軍",
	black: "黒軍",
	blue: "青軍",
	green: "緑軍",
	ally: "味方",
	enemy: "敵"
};
