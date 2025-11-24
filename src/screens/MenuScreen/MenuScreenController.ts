// src/screens/menu/MenuScreenController.ts

import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { MenuScreenView } from './MenuScreenView';
import { MenuScreenModel } from './MenuScreenModel';

export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private model: MenuScreenModel;

	// native HTML inputs (like in Mercury)
	private usernameInput: HTMLInputElement | null = null;
	private passwordInput: HTMLInputElement | null = null;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.view = new MenuScreenView(
			() => this.handleLogin(),
			() => this.handleGuestPlay()
		);
		this.model = new MenuScreenModel();

		// clicking the Konva fields focuses the real HTML inputs
		this.view.getUsernameField().on('click tap', () => this.usernameInput?.focus());
		this.view.getPasswordField().on('click tap', () => this.passwordInput?.focus());
	}

	getView(): MenuScreenView {
		return this.view;
	}

	// ---------------- HTML INPUT SETUP ----------------

	private ensureInputs(): void {
		const container = document.getElementById('container');
		if (!container) return;

		container.style.position = 'relative';

		// panel geometry must match MenuScreenView
		const PANEL_WIDTH = 420;
		const panelX = STAGE_WIDTH / 2 - PANEL_WIDTH / 2;
		const panelY = 250;

		// ---------- USERNAME ----------
		if (!this.usernameInput) {
			const input = document.createElement('input');
			input.type = 'text';
			input.placeholder = 'Enter username';

			Object.assign(input.style, {
				position: 'absolute',
				width: `${PANEL_WIDTH - 48}px`,
				padding: '10px 14px',
				fontSize: '18px',
				border: '2px solid rgba(148, 163, 184, 0.8)',
				borderRadius: '12px',
				background: '#020617',
				color: 'white',
				outline: 'none',
				left: `${panelX + 24}px`,
				top: `${panelY + 46}px`,
				zIndex: '10',
			});

			input.addEventListener('input', () => {
				this.model.username = input.value;
				// keep Konva display in sync (optional)
				// this.view.setUsernameDisplay(input.value);
			});

			container.appendChild(input);
			this.usernameInput = input;
		}

		// ---------- PASSWORD ----------
		if (!this.passwordInput) {
			const input = document.createElement('input');
			input.type = 'password';
			input.placeholder = 'Enter password';

			Object.assign(input.style, {
				position: 'absolute',
				width: `${PANEL_WIDTH - 48}px`,
				padding: '10px 14px',
				fontSize: '18px',
				border: '2px solid rgba(148, 163, 184, 0.8)',
				borderRadius: '12px',
				background: '#020617',
				color: 'white',
				outline: 'none',
				left: `${panelX + 24}px`,
				top: `${panelY + 126}px`,
				zIndex: '10',
			});

			input.addEventListener('input', () => {
				this.model.password = input.value;
				// if you still want masked text in Konva:
				// this.view.setPasswordDisplay('*'.repeat(input.value.length));
			});

			input.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					this.handleLogin();
				}
			});

			container.appendChild(input);
			this.passwordInput = input;
		}
	}

	private removeInputs(): void {
		if (this.usernameInput) {
			this.usernameInput.remove();
			this.usernameInput = null;
		}
		if (this.passwordInput) {
			this.passwordInput.remove();
			this.passwordInput = null;
		}
	}

	// ---------------- BUTTON HANDLERS ----------------

	private handleLogin(): void {
		const username = this.usernameInput?.value.trim() ?? '';
		const password = this.passwordInput?.value ?? '';

		this.model.username = username;
		this.model.password = password;

		console.log('Login with', username, password);
		// later: call loginUser(...) here
		this.screenSwitcher.switchToScreen({ type: 'level selection' });
	}

	private handleGuestPlay(): void {
		this.screenSwitcher.switchToScreen({ type: 'level selection' });
	}

	// ---------------- LIFECYCLE ----------------

	override show(): void {
		super.show();
		this.view.show();
		this.ensureInputs();
		this.usernameInput?.focus();
	}

	override hide(): void {
		super.hide();
		this.view.hide();
		this.removeInputs();
	}

	override update(_dt: number): void {
		// no per-frame logic needed
	}

	dispose(): void {
		this.removeInputs();
	}
}