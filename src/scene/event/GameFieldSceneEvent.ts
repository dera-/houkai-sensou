import {GameCharacterModel} from "../../model/GameCharacterModel";
import {GamePointerModel} from "../../model/GamePointerModel";
import {GameBuildingModel} from "../../model/GameBuildingModel";
import {GameItemModel} from "../../model/GameItemModel";
import {GamePlayerModel} from "../../model/GamePlayerModel";
import {FrameSpriteRepository} from "../../repository/FrameSpriteRepository";
import {deleteFromArray} from "../../util/Array";
import {GameLifeObjectModel} from "../../model/GameLifeObjectModel";
import {getDamage} from "../../util/BattleCalculate";
import {config} from "../../config/config";
import {GameButtonModel} from "../../model/GameButtonModel";
import {getPlayer, getPlayerInField, getSameTeamPlayersInField} from "../../repository/model/GamePlayerRepository";
import {GameOverScene} from "../GameOverScene";
import {GamePlayerSimplicityStatusViewer} from "../../model/GamePlayerSimplicityStatusViewer";
import {addScene} from "../../repository/SceneRepository";
import {GameFieldModel} from "../../model/GameFieldModel";
import {GameAutomaticPlayerModel} from "../../model/GameAutomaticPlayerModel";

export interface GameFieldSceneEventParameter {
	scene: g.Scene;
	stageId: number;
	gameFieldModel: GameFieldModel;
	gameCharacterModels: GameCharacterModel[];
	gameItemModels: GameItemModel[];
	gameBuildingModels: GameBuildingModel[];
	simplicityStatusViewer: GamePlayerSimplicityStatusViewer;
	pointerModels: {[key: number]: GamePointerModel};
	directionSprites: g.Sprite[];
	directionSpriteCaches: g.Sprite[];
}

export class GameFieldSceneEvent {
	private parameter: GameFieldSceneEventParameter;
	private eventCaches: {[key: string]: (ev: any) => void};

	constructor(parameter: GameFieldSceneEventParameter) {
		this.parameter = parameter;
		this.eventCaches = {};
	}

	getCharacterEvent(model: GameCharacterModel) {
		const charaSprite = model.sprite;
		const event = () => {
			if (false === model.isAlive() && false === model.isDeading()) {
				model.deadAction(this.parameter.scene, () => {
					deleteFromArray(this.parameter.gameCharacterModels, model);
					(getPlayer(config.common.player_id.ai) as GameAutomaticPlayerModel).changeGoal(model);
				});
				if (this.parameter.pointerModels[model.id] !== undefined && this.parameter.pointerModels[model.id].sprite !== undefined) {
					this.deletePointerModel(model);
				}
			}
			if (this.parameter.pointerModels[model.id] !== undefined && this.parameter.pointerModels[model.id].sprite !== undefined) {
				this.parameter.pointerModels[model.id].move();
			}
			if (model.goal) {
				const targetX = model.goal.relationalPlace.x;
				const targetY = model.goal.relationalPlace.y;
				if (Math.abs(targetX - charaSprite.x) < 1 && Math.abs(targetY - charaSprite.y) < 1) {
					this.deletePointerModel(model);
				} else if (false === model.isAttackRangeToTarget()) {
					if (false === this.isCollisionBySomeObject(model)) {
						model.moveAnimation(targetX, targetY);
					} else {
						(getPlayer(config.common.player_id.ai) as GameAutomaticPlayerModel).collision(model.id);
					}
				}
			}
			// isAlive判定ないと死んでも攻撃みたいなことができてしまう。そもそもイベントを削除すればいいだけの話だと思うけど、一旦生きているかどうかの分岐でごまかす。
			if (model.isAlive() && model.canAttack() && model.attackTarget != null) {
				model.attackAction(this.parameter.scene);
				const gameObject: GameLifeObjectModel = model.attackTarget;
				const damage = getDamage(model, gameObject);
				gameObject.damage(damage);
				if (gameObject instanceof GameCharacterModel) {
					gameObject.damageAction(this.parameter.scene);
				}
			}
		};
		return event;
	}

	getPointMoveCharacterEvent(model: GameCharacterModel) {
		const charaSprite = model.sprite;
		const event = (ev: any) => {
			if (model.affiliation === null || model.affiliation !== getPlayer(ev.player.id).team) {
				return;
			}
			const x = charaSprite.x + ev.point.x + ev.startDelta.x;
			const y = charaSprite.y + ev.point.y + ev.startDelta.y;
			// TODO: キャラクタの移動中もこのメソッドが呼び出せるようにする
			this.displayDirectionSprites(
				this.generateDirectionSprites([this.getPlayerModel(ev.player.id).camera], charaSprite.x, charaSprite.y, x, y)
			);
		};
		return event;
	}

	getPointUpCharacterEvent(model: GameCharacterModel) {
		const charaSprite = model.sprite;
		const event = (ev: any) => {
			if (model.affiliation === null || model.affiliation !== getPlayer(ev.player.id).team) {
				return;
			}
			const targetX = Math.round(charaSprite.x + ev.point.x + ev.startDelta.x);
			const targetY = Math.round(charaSprite.y + ev.point.y + ev.startDelta.y);

			// 矢印スプライト削除
			this.parameter.directionSprites.forEach((sprite: g.Sprite) => {
				this.parameter.scene.remove(sprite);
			});
			this.parameter.directionSprites = [];

			// 行き先が場外なら強制キャンセル
			if (targetX < 0 || g.game.width < targetX || targetY < 0 || g.game.height < targetY) {
				return;
			}

			// ポインタースプライト
			const sprite: g.FrameSprite = FrameSpriteRepository.instance.generate(
				"pointer",
				this.parameter.scene,
				[this.getPlayerModel(ev.player.id).camera]
			);
			if (this.parameter.pointerModels[model.id] === undefined) {
				this.parameter.pointerModels[model.id] = new GamePointerModel();
			}
			this.parameter.pointerModels[model.id].registerSprite(this.parameter.scene, sprite, targetX, targetY);
			model.goal = this.parameter.pointerModels[model.id];

			// ターゲット
			model.attackTarget = null;
			this.parameter.gameCharacterModels.forEach((chara) => {
				if (model.id !== chara.id && false === chara.isSameAffiliation(model) && chara.isAlive() && chara.isHit(targetX, targetY)) {
					model.attackTarget = chara;
				}
			});
			this.parameter.gameBuildingModels.forEach((building) => {
				if (false === building.isSameAffiliation(model) && building.isAlive() && building.isHit(targetX, targetY)) {
					model.attackTarget = building;
				}
			});
		};
		return event;
	}

	getPointUpCharacterEventWhenNegotiation(model: GameLifeObjectModel) {
		const event = (ev: any) => {
			// 交渉フェイズ時にキャラクターをクリックした時の動作を定義する
			// クリックしたら、お金が足りている場合味方になってお金が減る感じで
			const player = this.getPlayerModel(ev.player.id);
			if (player.canBuy(model)) {
				player.buy(model);
				this.parameter.simplicityStatusViewer.updateMoneyLabel(player);
				model.showCostView(false);
				const eventKey = `negotiation_${model.lifeId}`;
				if (this.eventCaches[eventKey]) {
					model.sprite.pointUp.remove({func: this.eventCaches[eventKey], owner: this});
					delete this.eventCaches[eventKey];
				}
				if (model instanceof GameCharacterModel) {
					const chara = (model as GameCharacterModel);
					this.parameter.gameBuildingModels.forEach(building => {
						chara.removeBuff(building.lifeId);
						if (building.buildingType === "power-up" && chara.affiliation === building.affiliation
							|| building.buildingType === "power-down" && chara.affiliation !== building.affiliation) {
							chara.addBuff(building.lifeId, building.buf);
						}
					});
				}
				// 建物の所属が変わるので、建物の影響を受ける対象も更新する
				if (model instanceof GameBuildingModel) {
					const buildingModel = (model as GameBuildingModel);
					// TODO: 非常に2度手間感。。落ち着いたら修正
					if (buildingModel.buildingType === "power-up" || buildingModel.buildingType === "power-down") {
						this.parameter.gameCharacterModels.forEach(chara => {
							chara.removeBuff(buildingModel.lifeId);
							if (buildingModel.buildingType === "power-up" && chara.affiliation === buildingModel.affiliation
								|| buildingModel.buildingType === "power-down" && chara.affiliation !== buildingModel.affiliation) {
								chara.addBuff(buildingModel.lifeId, buildingModel.buf);
							}
						});
					}
				}
			}
		};
		return event;
	}

	getItemEvent(itemModel: GameItemModel) {
		const event = () => {
			const getters = this.parameter.gameCharacterModels.filter((character) => {
				return itemModel.isCollision(character);
			});
			if (getters.length > 0) {
				const targetCharacter = getters[0];
				switch (itemModel.itemType) {
					case "money":
						// 現状、チーム内で均等に配布している
						// TODO: 占有キャラが取得した時に占有する処理もいれたい
						if (targetCharacter.affiliation !== null) {
							const players = getSameTeamPlayersInField(this.parameter.stageId, targetCharacter.affiliation);
							players.forEach(player => {
								player.addMoney(itemModel.money / players.length);
								if (player.id === g.game.selfId) {
									this.parameter.simplicityStatusViewer.updateMoneyLabel(player);
								}
							});
						}
						break;
					case "recover":
						targetCharacter.recover(itemModel.recover);
						this.parameter.simplicityStatusViewer.changeStatusViewPane(
							this.parameter.scene,
							targetCharacter.imageId,
							targetCharacter.getRecoverText(itemModel.recover),
							GameCharacterModel.WIN_POSE
						);
						break;
					case "power-up":
						targetCharacter.powerUp(itemModel.attack, itemModel.defense, itemModel.speed);
						this.parameter.simplicityStatusViewer.changeStatusViewPane(
							this.parameter.scene,
							targetCharacter.imageId,
							targetCharacter.getPowerUpText(itemModel.attack, itemModel.defense, itemModel.speed),
							GameCharacterModel.WIN_POSE
						);
						break;
					default:
						break;
				}
				itemModel.deleteSprite(this.parameter.scene);
				targetCharacter.winPose(this.parameter.scene);
				this.deletePointerModel(targetCharacter);
				deleteFromArray(this.parameter.gameItemModels, itemModel);
				(getPlayer(config.common.player_id.ai) as GameAutomaticPlayerModel).changeGoal(itemModel);
			}
		};
		return event;
	}

	getBuildingEvent(buildingModel: GameBuildingModel) {
		const event = () => {
			if (false === buildingModel.isAlive() && false === buildingModel.isDeading()) {
				// 爆発
				buildingModel.breakEffect(this.parameter.scene, () => {
					this.parameter.gameCharacterModels.forEach(chara => {
						chara.removeBuff(buildingModel.lifeId);
					});
					deleteFromArray(this.parameter.gameBuildingModels, buildingModel);
					(getPlayer(config.common.player_id.ai) as GameAutomaticPlayerModel).changeGoal(buildingModel);
					if (buildingModel.isBase()) {
						addScene(new GameOverScene({game: g.game, assetIds: config.game_over.asset_ids}, this.parameter.stageId, buildingModel.affiliation));
					}
				});
			}
		};
		return event;
	}

	// とりあえず無所属のキャラ・建物の購入イベントのON/OFFだけ。どこかに所属しているキャラ・建物のイベントON/OFFは一旦考えない
	getPointUpModeButtonEvent() {
		const buttonModel = this.parameter.simplicityStatusViewer.modeButton;
		const event = (ev: any) => {
			let targets: GameLifeObjectModel[] = this.parameter.gameCharacterModels.filter(model => {
				return model.affiliation === null;
			});
			targets = targets.concat(this.parameter.gameBuildingModels.filter(m => m.affiliation === null && !m.isBase()));
			buttonModel.changeMessage();
			switch (buttonModel.messageIndex) {
				case GameButtonModel.MODE_BATTLE:
					// フィルターの削除・購入対象のイベント解除
					targets.forEach(target => {
						target.showCostView(false);
						const eventKey = `negotiation_${target.lifeId}`;
						if (this.eventCaches[eventKey]) {
							target.sprite.pointUp.remove({func: this.eventCaches[eventKey], owner: this});
							delete this.eventCaches[eventKey];
						}
					});
					return;
				case GameButtonModel.MODE_NEGOTIATION:
					// フィルターの追加・購入対象のイベント登録
					targets.forEach(model => {
						model.showCostView(true);
						const eventKey = `negotiation_${model.lifeId}`;
						if (!this.eventCaches[eventKey]) {
							const negotiationEvent = this.getPointUpCharacterEventWhenNegotiation(model);
							model.sprite.pointUp.add({func: negotiationEvent, owner: this});
							this.eventCaches[eventKey] = negotiationEvent;
						}
					});
					return;
			}
		};
		return event;
	}

	getPointMoveFieldTileEvent() {
		const event = (ev: g.PointMoveEvent) => {
			const beforeX = this.parameter.gameFieldModel.viewPoint.x;
			const beforeY = this.parameter.gameFieldModel.viewPoint.y;
			this.parameter.gameFieldModel.moveViewPoint(ev.prevDelta.x, ev.prevDelta.y);
			const xDiff = this.parameter.gameFieldModel.viewPoint.x - beforeX;
			const yDiff = this.parameter.gameFieldModel.viewPoint.y - beforeY;
			this.parameter.gameCharacterModels.forEach(model => model.moveRelationalPlace(-1 * xDiff, -1 * yDiff));
			this.parameter.gameBuildingModels.forEach(model => model.moveRelationalPlace(-1 * xDiff, -1 * yDiff));
			this.parameter.gameItemModels.forEach(model => model.moveRelationalPlace(-1 * xDiff, -1 * yDiff));
			Object.keys(this.parameter.pointerModels).forEach((id: any) => {
				this.parameter.pointerModels[id].moveRelationalPlace(-1 * xDiff, -1 * yDiff);
			});
		};
		return event;
	}

	// TODO: 流石に型が適当すぎるので、あとでインターフェースに直すなりする
	getShowStatusEvent(model: any) {
		const event = () => {
			const frames = model instanceof GameCharacterModel ? GameCharacterModel.DOWN_MOVING : [0];
			this.parameter.simplicityStatusViewer.changeStatusViewPane(this.parameter.scene, model.imageId, model.getStatusLabelText(), frames);
		};
		return event;
	}

	private deletePointerModel(characterModel: GameCharacterModel) {
		if (this.parameter.pointerModels[characterModel.id]) {
			this.parameter.pointerModels[characterModel.id].unregisterSprite(this.parameter.scene);
			characterModel.goal = undefined;
			delete(this.parameter.pointerModels[characterModel.id]);
		}
	}

	private isCollisionBySomeObject(model: GameCharacterModel) {
		const place = model.goal.relationalPlace;
		const futureStatus = model.getSpriteNextStatus(place.x, place.y);
		const farFutureStatus = model.getSpriteNextStatus(place.x, place.y, 10);
		const collisionByCharacter = this.parameter.gameCharacterModels.some(chara => {
			if (model.id === chara.id) {
				return false;
			}
			if (GameLifeObjectModel.isCollision(chara, model.relationArea)) {
				return GameLifeObjectModel.isCollision(chara, farFutureStatus);
			}
			return GameLifeObjectModel.isCollision(chara, futureStatus);
		});
		const collisionByBuilding = this.parameter.gameBuildingModels.some(building => {
			return GameLifeObjectModel.isCollision(building, futureStatus);
		});
		return collisionByCharacter || collisionByBuilding;
	}

	private getPlayerModel(playerId: string): GamePlayerModel {
		const player = getPlayerInField(this.parameter.stageId, playerId);
		if (player === null) {
			throw new Error("想定外のIDが出てきました");  // TODO: 例外キャッチ処理とか入れたい
		}
		return player;
	}

	private displayDirectionSprites(directionSpritesTmp: g.Sprite[]): void {
		if (this.parameter.directionSprites.length !== directionSpritesTmp.length) {
			this.parameter.directionSprites.forEach((sprite) => {
				this.parameter.scene.remove(sprite);
			});
			this.parameter.directionSprites = directionSpritesTmp;
			this.parameter.directionSprites.forEach((sprite) => {
				this.parameter.scene.append(sprite);
			});
		} else {
			// 各矢印スプライトの角度、座標の変更
			for (let i = 0; i < this.parameter.directionSprites.length; i++) {
				this.parameter.directionSprites[i].x = directionSpritesTmp[i].x;
				this.parameter.directionSprites[i].y = directionSpritesTmp[i].y;
				this.parameter.directionSprites[i].angle = directionSpritesTmp[i].angle;
				this.parameter.directionSprites[i].modified();
			}
		}
	}

	private generateDirectionSprites(cameras: g.Camera2D[], startX: number, startY: number, endX: number, endY: number): g.Sprite[] {
		const radian = Math.atan2(endY - startY, endX - startX);
		const distance = Math.sqrt( Math.pow( endX - startX, 2 ) + Math.pow( endY - startY, 2 ) );
		let count = Math.round(distance / config.game.map_chip.size);
		let interval;
		if (count > this.parameter.directionSpriteCaches.length) {
			count = this.parameter.directionSpriteCaches.length;
			interval = distance / this.parameter.directionSpriteCaches.length;
		} else {
			interval = config.game.map_chip.size;
		}
		const sprites: g.Sprite[] = [];
		for (let i = 0; i < count; i++) {
			// 移動方向アイコン
			const sprite = this.parameter.directionSpriteCaches[i];
			sprite.x = startX + i * interval * Math.cos(radian);
			sprite.y = startY + i * interval * Math.sin(radian);
			sprite.angle = radian / Math.PI * 180;
			sprite.targetCameras = cameras;
			sprites.push(sprite);
		}
		return sprites;
	}
}
