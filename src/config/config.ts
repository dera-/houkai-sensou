export const config: any = {
	"common": {
		"player_id": {
			"ai": g.game.selfId + "1"
		}
	},
	"game": {
		"play_space": {
			"x": 0,
			"y": 0,
			"width": g.game.width,
			"height": 0.9 * g.game.height
		},
		"option_space": {
			"x": 0,
			"y": 0.9 * g.game.height,
			"width": g.game.width,
			"height": 0.1 * g.game.height,
			"mode_button": {
				"x": 0.175 * g.game.width,
				"y": 0.91 * g.game.height
			},
			"status_view": {
				"x": 0.3 * g.game.width,
				"y": 0.90 * g.game.height,
				"width": 0.7 * g.game.width,
				"height": 0.1 * g.game.height,
				"target_icon": {
					"x_rate": 0.03,
					"y_rate": 0.1,
					"width": 0.08 * g.game.height,
					"height": 0.08 * g.game.height
				},
				"target_detail": {
					"x_rate": 0.15,
					"y_rate": 0.25,
					"size": 20
				}
			}
		},
		"waiting": 2000,
		"player": {
			"default_money": 500,
		},
		"character": {
			"interval": {
				"normal": 200,
				"win": 333,
				"attack": 250,
				"damage": 500,
			},
			"rigid_time": {
				"win": 2000,
				"after-attack": 2000,
				"battle": 2000,
				"dead": 2000,
			},
			"affiliation_color": {
				"ally": "cyan",
				"enemy": "red",
				"none":  "gray"
			},
			"default_attack_range": {
				"min": 0,
				"max": 50
			},
			"standard_speed": 20
		},
		"map_chip": {
			"size": 32
		},
		"hp_bar": {
			"height": 10
		},
		"button": {
			"width": 0.16 * g.game.height, // 128,
			"height": 0.08 * g.game.height // 64,
		},
		"cost_viewer": {
			"width": 64,
			"height": 48
		},
		"gold_icon": {
			"size": 0.08 * g.game.height
		},
		"asset_ids": [
			"testMapImage",
			"dot_tami",
			"dot_heroin0",
			"dot_heroin1",
			"dot_dark_thief",
			"dot_thief0",
			"dot_gachi",
			"dot_ike",
			"dot_kishi",
			"dot_kizoku",
			"dot_kura",
			"dot_miko",
			"dot_oni",
			"dot_osana",
			"dot_sensi",
			"dot_shiro",
			"dot_tami",
			"dot_tomo",
			"dot_tuyo",
			"dot_wa",
			"dot_yaba",
			"moneyItem",
			"pointer",
			"direction",
			"testMapText",
			"testArrangement",
			"DefaultBattleEffect",
			"BuildingImg",
			"ExplodeImg",
			"button",
			"pushed_button",
			"cost_viewer_down",
			"cost_viewer_up",
			"gold",
			"option_frame",
			"attack_up",
			"defense_up",
			"speed_up",
			"recover0",
			"recover1",
			"yubiwa",
			"one_coin",
			"monies"
		]
	},
	"title": {
		"labels": {
			"title": {
				"x": 0.02 * g.game.width,
				"y": 0.2 * g.game.height,
				"size": 72
			},
			"current_status": {
				"x": 0.3 * g.game.width,
				"y": 0.5 * g.game.height,
				"size": 28
			},
			"push_message": {
				"x": 0.18 * g.game.width,
				"y": 0.7 * g.game.height,
				"size": 32
			}
		},
		"buttons": {
			"x_start": 0.25 * g.game.width,
			"y_start": 0.85 * g.game.height,
			"x_interval": 0.1 * g.game.width,
			"width": 0.2 * g.game.width,
			"height": 0.075 * g.game.width
		},
		"waiting_to_start": 2000,
		"minimum_member_count": 2,
		"asset_ids": [
			"button",
			"pushed_button",
			"back_normal"
		]
	},
	"game_over": {
		"labels": {
			"main": {
				"x": 0.2 * g.game.width,
				"y": 0.15 * g.game.height,
				"size": 56
			},
			"sub": {
				"x": 0.18 * g.game.width,
				"y": 0.5 * g.game.height,
				"size": 20
			}
		},
		"buttons": {
			"return_title": {
				"x": 0.45 * g.game.width,
				"y": 0.65 * g.game.height,
				"width": 0.3 * g.game.width,
				"height": 0.075 * g.game.width,
				"font_size": 12
			}
		},
		"asset_ids": [
			"button",
			"pushed_button",
			"back_normal",
			"back_lose",
			"continue"
		],
	}
};
