import {GamePlayerModel, GamePlayerParameter} from "./GamePlayerModel";
import {GameCharacterModel} from "./GameCharacterModel";
import {GameBuildingModel} from "./GameBuildingModel";
import {GameItemModel} from "./GameItemModel";
import {GameTeamType} from "../type/GameTeamType";
import {GameObjectOnFiledInterface, getDistance} from "./GameObjectOnFiledInterface";
import {GameLifeObjectModel} from "./GameLifeObjectModel";
import {GameCharacterPersonalityType} from "../type/GameCharacterPersonalityType";

export interface GameAutomaticPlayerParameter extends GamePlayerParameter {
	characters: GameCharacterModel[];
	buildings: GameBuildingModel[];
	items: GameItemModel[];
	targetAffiliation?: GameTeamType; // 後々複数指定できるようにしたいが現状は1対1のゲームなので、1つで十分
}

// 基本戦略は以下の通り
// 強化アイテム・バフ/デバフ建物・自軍以外のキャラ・本拠地に近い奴はそれを狙っていく、
// エース級のステータスのやつは本拠地を狙って突っ込む(移動線上に障害があれば潰す感じで)
// 素早いやつは積極的に金アイテムを取りに行く(もしくは建物破壊)。こいつは戦闘を避ける感じで
// 戦闘要員(特にエース)は死にそうになったら回復アイテム取りに行く(一旦考えないでおく？)
// あと、逃走者は戦わず逃げる。HPが減ったら回復アイテム取りに行く(target無し移動は難しいので今回は見送り)
export class GameAutomaticPlayerModel extends GamePlayerModel {
	// Sceneのやつと同じオブジェクトを使う
	private characters: GameCharacterModel[];
	private buildings: GameBuildingModel[];
	private items: GameItemModel[];
	private targetAffiliation: GameTeamType|null;

	constructor(params: GameAutomaticPlayerParameter) {
		super(params);
		this.characters = params.characters;
		this.buildings = params.buildings;
		this.items = params.items;
		this.targetAffiliation = params.targetAffiliation || null;
	}

	decideGoals(targetPersonality?: GameCharacterPersonalityType): void {
		const characters = this.characters.filter(chara => {
			if (targetPersonality && chara.personality !== targetPersonality) {
				return false;
			}
			return this.team === chara.affiliation;
		});
		characters.forEach(chara => {
			this.decideGoal(chara);
		});
	}

	changeGoal(goal: GameObjectOnFiledInterface): void {
		const characters = this.characters.filter(chara => this.team === chara.affiliation && chara.goal === goal);
		characters.forEach(chara => {
			this.decideGoal(chara);
		});
	}

	collision(allyId: number): void {
		const characters = this.characters.filter(chara => this.team === chara.affiliation && chara.id === allyId);
		if (characters.length === 0 || characters[0].goal === undefined) {
			return;
		}
		const allyChara = characters[0];
		let collisions = this.getCollisions(allyChara, allyChara.goal);
		if (collisions.length === 0) {
			return;
		}
		collisions = collisions.filter(t => t.affiliation !== this.team);
		if (collisions.length > 0) {
			this.setGoal(allyChara, collisions[0]);
		} else {
			this.decideGoal(allyChara);
		}
	}

	private decideGoal(chara: GameCharacterModel): void {
		let goal: GameObjectOnFiledInterface;
		switch (chara.personality) {
			case "ace":
				goal = this.findTargetForAce(chara);
				break;
			case "thief":
				goal = this.findTargetForThief(chara);
				break;
			case "guardian":
				goal = this.findTargetForGuardian(chara);
				break;
			default:
				goal = this.findTargetForNormal(chara);
				break;
		}
		this.setGoal(chara, goal);
	}

	private setGoal(chara: GameCharacterModel, goal: GameObjectOnFiledInterface|undefined) {
		chara.goal = goal;
		if (goal instanceof GameLifeObjectModel) {
			chara.attackTarget = goal as GameLifeObjectModel;
		}
	}

	private findTargetForNormal(allyChara: GameCharacterModel): GameObjectOnFiledInterface|undefined {
		let targets: GameObjectOnFiledInterface[] = this.characters.filter(chara => chara.affiliation !== allyChara.affiliation);
		targets = targets.concat(this.buildings.filter(b => b.affiliation !== allyChara.affiliation));
		targets = targets.concat(this.items.filter(i => i.itemType === "power-up"));
		return this.getNearestTargetWithoutCollision(allyChara, targets);
	}

	private findTargetForAce(allyChara: GameCharacterModel): GameObjectOnFiledInterface|undefined {
		let target: GameObjectOnFiledInterface;
		const targetBases = this.buildings.filter(building => this.targetAffiliation === building.affiliation && building.isBase());
		if (targetBases.length === 0) {
			return undefined;
		}
		target = targetBases[0];
		let collisions = this.getCollisions(allyChara, target);
		if (collisions.length === 0) {
			return target;
		}
		collisions = collisions.filter(t => t.affiliation !== this.team);
		return collisions.length === 0 ? this.findTargetForNormal(allyChara) : collisions[0]; // 雑に一番上のやつから狙う
	}

	private findTargetForThief(allyChara: GameCharacterModel): GameObjectOnFiledInterface|undefined {
		// 今の所、AIキャラで回復アイテム取る奴いないのでthiefに盗らせる
		const targets: GameObjectOnFiledInterface[] = this.items.filter(i => i.itemType === "money" || i.itemType === "recover");
		return this.getNearestTargetWithoutCollision(allyChara, targets);
	}

	private findTargetForGuardian(allyChara: GameCharacterModel): GameObjectOnFiledInterface|undefined {
		// 基本的に動かず近づいてきたやつを狙う感じで
		const targets: GameObjectOnFiledInterface[] =
			this.characters.filter(chara => chara.affiliation !== this.team && allyChara.isAttackRange(chara, 1.2));
		return this.getNearestTargetWithoutCollision(allyChara, targets);
	}

	private getNearestTargetWithoutCollision(
		allyChara: GameCharacterModel, targets: GameObjectOnFiledInterface[]): GameObjectOnFiledInterface|undefined {
		targets = targets.sort((a, b) => {
			return getDistance(allyChara, a) - getDistance(allyChara, b); // 近い順にソート
		});
		for (const target of targets) {
			const collisions = this.getCollisions(allyChara, target);
			if (collisions.length === 0) {
				return target;
			}
		}
		return undefined;
	}

	// 目標に進むと衝突するであろうものを取得
	private getCollisions(allyChara: GameCharacterModel, goal: GameObjectOnFiledInterface): GameLifeObjectModel[] {
		const goalPlace = goal.relationalPlace;
		const futureStatus = allyChara.getSpriteNextStatus(goalPlace.x, goalPlace.y);
		let collisions: GameLifeObjectModel[] =
			this.characters.filter(chara => {
				return chara !== allyChara && chara !== goal && GameLifeObjectModel.isCollision(chara, futureStatus);
			});
		collisions = collisions.concat(this.buildings.filter(b => b !== goal && GameLifeObjectModel.isCollision(b, futureStatus)));
		return collisions;
	}
}
