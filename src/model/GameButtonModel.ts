export class GameButtonModel {
	private _sprite: g.Sprite;
	private _pushedSprite: g.Sprite;
	private _label: g.Label;
	private _rect: g.FilledRect;
	private messages: string[];
	private defaultButtonEvent: g.HandlerFunction<any>;
	private _messageIndex: number = 0;
	private isSwitcher: boolean;

	constructor(
		sprite: g.Sprite,
		pushedSprite: g.Sprite,
		label: g.Label,
		rect: g.FilledRect,
		messages: string[],
		isSwitcher: boolean = false
	) {
		this._sprite = sprite;
		this._pushedSprite = pushedSprite;
		this._label = label;
		this._rect = rect;
		this.messages = messages;
		this.label.text = this.messages[this._messageIndex];
		this.defaultButtonEvent = this.switchSprite();
		this.isSwitcher = isSwitcher;
		this.addDefaultEvent();
	}

	get sprite(): g.Sprite {
		return this._sprite;
	}

	get pushedSprite(): g.Sprite {
		return this._pushedSprite;
	}

	get label(): g.Label {
		return this._label;
	}

	get rect(): g.FilledRect {
		return this._rect;
	}

	get messageIndex(): number {
		return this._messageIndex;
	}

	changeMessage(): void {
		this._messageIndex = (this._messageIndex + 1) % this.messages.length;
		this._label.text = this.messages[this.messageIndex];
		this._label.invalidate();
	}

	changeCurrentText(text: string): void {
		this._label.text = text;
		this._label.invalidate();
	}

	registerSpriteGroup(scene: g.Scene): void {
		this.pushedSprite.hide();
		scene.append(this.pushedSprite);
		this.sprite.show();
		scene.append(this.sprite);
		scene.append(this.label);
		scene.append(this.rect);
	}

	removeSpriteGroup(scene: g.Scene): void {
		scene.remove(this.rect);
		scene.remove(this.label);
		scene.remove(this.sprite);
		scene.remove(this.pushedSprite);
	}

	addDefaultEvent(): void {
		if (!this.isSwitcher) {
			if (!this._rect.pointUp.contains(this.defaultButtonEvent)) {
				this._rect.pointUp.add(this.defaultButtonEvent);
			}
		} else {
			if (!this._rect.pointDown.contains(this.defaultButtonEvent)) {
				this._rect.pointDown.add(this.defaultButtonEvent);
			}
		}
	}

	removeDefaultEvent(): void {
		if (!this.isSwitcher) {
			this._rect.pointUp.remove(this.defaultButtonEvent);
		} else {
			this._rect.pointDown.remove(this.defaultButtonEvent);
		}
	}

	private switchSprite() {
		return () => {
			if (this.sprite.visible()) {
				this.pushedSprite.show();
				this.sprite.hide();
			} else if (this.pushedSprite.visible()) {
				this.pushedSprite.hide();
				this.sprite.show();
			}
		};
	}
}

export namespace GameButtonModel {
	export const MODE_BATTLE = 0;
	export const MODE_NEGOTIATION = 1;
}
