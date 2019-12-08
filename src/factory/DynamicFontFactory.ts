export class DynamicFontFactory {
	static generateCommon(game: g.Game, size: number, fontFamily: g.FontFamily = g.FontFamily.Monospace) {
		return new g.DynamicFont({
			game,
			size,
			fontFamily
		});
	}
}
