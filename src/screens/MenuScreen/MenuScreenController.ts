// src/screens/menu/MenuScreenController.ts

import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { MenuScreenView } from './MenuScreenView';
import { MenuScreenModel } from './MenuScreenModel';

// centralize API base path
const USE_MOCK_AUTH = false;

// // CHANGE: if Express server runs on localhost:3000, use this:
const API_BASE = 'http://localhost:3000/api';
// // If API from the same origin as the game, just do:
// const API_BASE = '/api';

export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private model: MenuScreenModel;

	// native HTML inputs
	private usernameInput: HTMLInputElement | null = null;
	private passwordInput: HTMLInputElement | null = null;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.view = new MenuScreenView(
			() => {
				void this.handleLogin();
			},
			() => this.handleGuestPlay(),
			() => {
				void this.handleCreateAccount();
			}
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
			});

			input.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					void this.handleLogin();
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

	// LOGIN → call backend /api/login
	private async handleLogin(): Promise<void> {
		const username = this.usernameInput?.value.trim() ?? '';
		const password = this.passwordInput?.value ?? '';

		this.model.username = username;
		this.model.password = password;

		if (!username || !password) {
			alert('Please enter a username and password.');
			return;
		}

		if (USE_MOCK_AUTH) {
			console.log('[DEV] Login with', username, password);
			this.screenSwitcher.switchToScreen({ type: 'level selection' });
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			if (!res.ok) {
				console.error('Login HTTP error', res.status);
				alert('Error logging in. Please try again.');
				return;
			}

			const data = (await res.json()) as {
				success: boolean;
				message?: string;
				user?: { id: number; username: string };
			};

			if (!data.success || !data.user) {
				alert(data.message ?? 'Invalid username or password.');
				return;
			}

			this.model.currentUserID = data.user.id;

			// expose current user globally so other screens (level selection, planets)
			// can read it when calling progress APIs
			(window as any).__CURRENT_USER_ID__ = data.user.id;

			this.screenSwitcher.switchToScreen({ type: 'level selection' });
		} catch (err) {
			console.error('Login error', err);
			alert('Network / server error while logging in.');
		}
	}

	// CREATE ACCOUNT → call backend /api/create-account
	private async handleCreateAccount(): Promise<void> {
		const username = this.usernameInput?.value.trim() ?? '';
		const password = this.passwordInput?.value ?? '';

		this.model.username = username;
		this.model.password = password;

		if (!username || !password) {
			alert('Please enter a username and password.');
			return;
		}

		if (USE_MOCK_AUTH) {
			console.log('[DEV] Create account for', username);
			alert('Account created! (mock)');
			this.screenSwitcher.switchToScreen({ type: 'level selection' });
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/create-account`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			if (!res.ok) {
				console.error('Create account HTTP error', res.status);
				alert('Error creating account. Please try again.');
				return;
			}

			const data = (await res.json()) as {
				success: boolean;
				message?: string;
				user?: { id: number; username: string };
			};

			if (!data.success || !data.user) {
				alert(data.message ?? 'Could not create account. Username may already exist.');
				return;
			}

			this.model.currentUserID = data.user.id;
			(window as any).__CURRENT_USER_ID__ = data.user.id;

			// Backend should:
			//   - create user
			//   - initialize progress (planet 1 unlocked)
			//   - set current_planet_id
			//   - start autosave (if desired)
			// so the client just treats them as logged in.

			alert('Account created! You are now logged in.');
			this.screenSwitcher.switchToScreen({ type: 'level selection' });
		} catch (err) {
			console.error('Create account error', err);
			alert('Network / server error while creating account.');
		}
	}

	private handleGuestPlay(): void {
		// Guest: no DB user, so clear any previous login
		(window as any).__CURRENT_USER_ID__ = undefined;

		// No DB, no autosave, just start game
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
