export const deleteFromArray = (array: any[], target: any): void => {
	array.forEach((elem, index) => {
		if (elem === target) {
			array.splice(index, 1);
		}
	});
};

export const isIncludedInArray = (array: any[], target: any): boolean => {
	return array.some(elem => elem === target);
};
