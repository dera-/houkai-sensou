import {FrameSpriteRepository} from "../repository/FrameSpriteRepository";
import {SpriteRepository} from "../repository/SpriteRepository";
import {config} from "../config/config";

// Sprite, SpriteFrameデータのpreLoadを行う
export const preLoad = (): void => {
	// 目標地点アイコン
	FrameSpriteRepository.instance.register(
		"pointer",
		{
			assetId: "pointer",
			width: config.game.map_chip.size,
			height: config.game.map_chip.size,
			srcWidth: 192,
			srcHeight: 192,
			frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
			frameNumber: 0
		}
	);
	// 移動方向アイコン
	SpriteRepository.instance.register(
		"direction",
		{
			assetId: "direction",
			width: config.game.map_chip.size,
			height: config.game.map_chip.size,
			srcWidth: 255,
			srcHeight: 436
		}
	);
	// デフォルトバトルエフェクト
	FrameSpriteRepository.instance.register(
		"DefaultBattleEffect",
		{
			assetId: "DefaultBattleEffect",
			width: config.game.map_chip.size,
			height: config.game.map_chip.size,
			srcWidth: 120,
			srcHeight: 120,
			frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			frameNumber: 0
		}
	);
	// 爆発のエフェクト
	FrameSpriteRepository.instance.register(
		"ExplodeImg",
		{
			assetId: "ExplodeImg",
			width: 2 * config.game.map_chip.size,
			height: 2 * config.game.map_chip.size,
			srcWidth: 120,
			srcHeight: 120,
			frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			frameNumber: 0,
			interval: 100
		}
	);
	// コスト表示用枠(下側表示用)
	SpriteRepository.instance.register(
		"costViewerDown",
		{
			assetId: "cost_viewer_down",
			width: config.game.cost_viewer.width,
			height: config.game.cost_viewer.height,
			srcWidth: 178,
			srcHeight: 129
		}
	);
	// コスト表示用枠(上側表示用)
	SpriteRepository.instance.register(
		"costViewerUp",
		{
			assetId: "cost_viewer_up",
			width: config.game.cost_viewer.width,
			height: config.game.cost_viewer.height,
			srcWidth: 178,
			srcHeight: 129
		}
	);
	// ゲーム用ボタン
	SpriteRepository.instance.register(
		"button",
		{
			assetId: "button",
			width: config.game.button.width,
			height: config.game.button.height,
			srcWidth: 205,
			srcHeight: 111
		}
	);
	// ゲーム用ボタン(push時の表示)
	SpriteRepository.instance.register(
		"pushedButton",
		{
			assetId: "pushed_button",
			width: config.game.button.width,
			height: config.game.button.height,
			srcWidth: 205,
			srcHeight: 111
		}
	);
	// 金塊的なやつ
	FrameSpriteRepository.instance.register(
		"gold",
		{
			assetId: "gold",
			width: config.game.gold_icon.size,
			height: config.game.gold_icon.size,
			srcWidth: 192,
			srcHeight: 192,
			frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
			frameNumber: 0,
			interval: 200
		}
	);
	// ゲーム中の枠画像
	SpriteRepository.instance.register(
		"option_frame",
		{
			assetId: "option_frame",
			width: config.game.option_space.width,
			height: config.game.option_space.height,
			srcWidth: 1278,
			srcHeight: 177,
			x: config.game.option_space.x,
			y: config.game.option_space.y
		}
	);
	// ゲーム中ステータス画面の初期画像
	FrameSpriteRepository.instance.register(
		"default_icon",
		{
			assetId: "option_frame",
			width: config.game.option_space.status_view.target_icon.width,
			height: config.game.option_space.status_view.target_icon.height,
			srcWidth: 1278,
			srcHeight: 177,
			frames: [0]
		}
	);
	// 背景画像1
	SpriteRepository.instance.register(
		"back0",
		{
			assetId: "back0",
			width: g.game.width,
			height: g.game.height,
			srcWidth: 544,
			srcHeight: 416
		}
	);
	// 背景画像2
	SpriteRepository.instance.register(
		"back_normal",
		{
			assetId: "back_normal",
			width: g.game.width,
			height: g.game.height,
			srcWidth: 1471,
			srcHeight: 846
		}
	);
	// 背景画像3
	SpriteRepository.instance.register(
		"back_lose",
		{
			assetId: "back_lose",
			width: g.game.width,
			height: g.game.height,
			srcWidth: 800,
			srcHeight: 600
		}
	);
	// to_be_continue
	SpriteRepository.instance.register(
		"continue",
		{
			assetId: "continue",
			width: 0.8 * g.game.width,
			height: 90,
			srcWidth: 1150,
			srcHeight: 180,
			x: 0.1 * g.game.width,
			y: 0.8 * g.game.height,
			touchable: true
		}
	);
};
