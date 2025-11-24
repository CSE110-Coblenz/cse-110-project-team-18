// src/screens/menu/MenuScreenController.ts

import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { MenuScreenView } from './MenuScreenView';
import { MenuScreenModel } from './MenuScreenModel';

type FocusedField = 'username' | 'password' | null;

export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private model: MenuScreenModel;

	private focusedField: FocusedField = null;

	private handleKeyBound = (e: KeyboardEvent) => this.handleKey(e);

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.view = new MenuScreenView(
			() => this.handleLogin(),
			() => this.handleGuestPlay()
		);
		this.model = new MenuScreenModel();

		// Click → focus field
		this.view.getUsernameField().on('click tap', () => this.setFocus('username'));
		this.view.getPasswordField().on('click tap', () => this.setFocus('password'));

		// Cursor hint (mouse cursor, not text caret)
		this.view.getUsernameField().on('mouseenter', () => {
			this.view.getGroup().getStage()?.container().style.setProperty('cursor', 'text');
		});
		this.view.getPasswordField().on('mouseenter', () => {
			this.view.getGroup().getStage()?.container().style.setProperty('cursor', 'text');
		});
		this.view.getLoginGroup().on('mouseleave', () => {
			this.view.getGroup().getStage()?.container().style.setProperty('cursor', 'default');
		});
	}

	private setFocus(field: FocusedField) {
		this.focusedField = field;
	}

	private handleKey(e: KeyboardEvent) {
		if (!this.focusedField) return;

		e.preventDefault();

		let value =
			this.focusedField === 'username'
				? this.model.username
				: this.model.password;

		if (e.key === 'Backspace') {
			value = value.slice(0, -1);
		} else if (e.key === 'Enter') {
			if (this.focusedField === 'password') {
				this.handleLogin();
			}
			return;
		} else if (e.key.length === 1) {
			value += e.key;
		} else {
			return;
		}

		if (this.focusedField === 'username') {
			this.model.username = value;
			this.view.setUsernameDisplay(value);
		} else {
			this.model.password = value;
			this.view.setPasswordDisplay('*'.repeat(value.length));
		}
	}

	private handleLogin() {
		console.log('Login with', this.model.username, this.model.password);
		// this.screenSwitcher.switchToScreen({ type: 'level selection' });
	}

	private handleGuestPlay() {
		this.screenSwitcher.switchToScreen({ type: 'level selection' });
	}

	getView(): MenuScreenView {
		return this.view;
	}

	override show(): void {
		super.show();
		this.view.show();
		window.addEventListener('keydown', this.handleKeyBound);
	}

	override hide(): void {
		super.hide();
		this.view.hide();
		window.removeEventListener('keydown', this.handleKeyBound);
	}

	override update(_dt: number): void {
		// No per-frame logic needed yet
	}

	dispose(): void {
		window.removeEventListener('keydown', this.handleKeyBound);
	}
}