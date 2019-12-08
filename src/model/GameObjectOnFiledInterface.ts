export interface GameObjectOnFiledInterface {
	absolutePlace: g.CommonOffset;
	relationalPlace: g.CommonOffset;
	moveRelationalPlace(dx: number, dy: number): void;
}

export const getDistance = (object1: GameObjectOnFiledInterface, object2: GameObjectOnFiledInterface): number => {
	return getDistanceAboutCommonOffset(object1.relationalPlace, object2.relationalPlace);
};

export const getDistanceAboutCommonOffset = (offset1: g.CommonOffset, offset2: g.CommonOffset): number => {
	return Math.sqrt(Math.pow(offset2.x - offset1.x, 2) + Math.pow(offset2.y - offset1.y, 2));
};
