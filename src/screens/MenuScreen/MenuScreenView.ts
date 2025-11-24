// src/screens/menu/MenuScreenView.ts

import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton, createTextBox, setElementText } from '../../ui';
import { preloadImage } from '../../core/utils/AssetLoader';

/**
 * MenuScreenView - Login screen view
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private loginGroup: Konva.Group;

	private usernameField: Konva.Group;
	private passwordField: Konva.Group;

	constructor(onLoginClick: () => void, onGuestPlayClick: () => void) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen',
		});

		//-------------------------------------------------------
		// Background
		//-------------------------------------------------------
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/MainMenuBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);

		//-------------------------------------------------------
		// Login box container
		//-------------------------------------------------------
		const PANEL_WIDTH = 420;
		const PANEL_HEIGHT = 320;
		const panelX = STAGE_WIDTH / 2 - PANEL_WIDTH / 2;
		const panelY = 250;

		this.loginGroup = new Konva.Group({
			x: panelX,
			y: panelY,
			listening: true,
		});

		const panelRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: PANEL_WIDTH,
			height: PANEL_HEIGHT,
			cornerRadius: 24,
			fill: 'rgba(15,23,42,0.9)', // dark overlay
			stroke: '#0B1220',
			strokeWidth: 2,
			shadowColor: 'rgba(0,0,0,0.45)',
			shadowBlur: 18,
			shadowOffsetY: 4,
		});
		this.loginGroup.add(panelRect);

		//-------------------------------------------------------
		// USERNAME label + input field
		//-------------------------------------------------------
		const labelUsername = new Konva.Text({
			x: 24,
			y: 20,
			text: 'USERNAME',
			fontFamily: 'Press Start 2P',
			fontSize: 14,
			fill: '#FFFFFF',
		});
		this.loginGroup.add(labelUsername);

		this.usernameField = createTextBox({
			x: 24,
			y: 46,
			width: PANEL_WIDTH - 48,
			height: 40,
			text: '',
			colorKey: 'surface_alt', // from ThemeConfig
			fontColorKey: 'text_inverse',
			verticalAlign: 'middle',
		});
		this.usernameField.listening(true);
		this.loginGroup.add(this.usernameField);

		//-------------------------------------------------------
		// PASSWORD label + input field
		//-------------------------------------------------------
		const labelPassword = new Konva.Text({
			x: 24,
			y: 100,
			text: 'PASSWORD',
			fontFamily: 'Press Start 2P',
			fontSize: 14,
			fill: '#FFFFFF',
		});
		this.loginGroup.add(labelPassword);

		this.passwordField = createTextBox({
			x: 24,
			y: 126,
			width: PANEL_WIDTH - 48,
			height: 40,
			text: '',
			colorKey: 'surface_alt',
			fontColorKey: 'text_inverse',
			verticalAlign: 'middle',
		});
		this.passwordField.listening(true);
		this.loginGroup.add(this.passwordField);

		//-------------------------------------------------------
		// LOG IN button
		//-------------------------------------------------------
		const loginButton = createButton({
			x: 24,
			y: 190,
			width: PANEL_WIDTH - 48,
			height: 48,
			text: 'LOG IN',
			colorKey: 'primary',
			hoverColorKey: 'primary_hover',
			onClick: onLoginClick,
		});
		this.loginGroup.add(loginButton);

		//-------------------------------------------------------
		// GUEST PLAY button
		//-------------------------------------------------------
		const guestButton = createButton({
			x: 24,
			y: 250,
			width: PANEL_WIDTH - 48,
			height: 48,
			text: 'GUEST PLAY',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onGuestPlayClick,
		});
		this.loginGroup.add(guestButton);

		this.group.add(this.loginGroup);
	}

	//-------------------------------------------------------
	// View Methods
	//-------------------------------------------------------
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	getLoginGroup(): Konva.Group {
		return this.loginGroup;
	}

	setUsernameDisplay(text: string) {
		setElementText(this.usernameField, text);
	}

	setPasswordDisplay(text: string) {
		setElementText(this.passwordField, text);
	}

	getUsernameField(): Konva.Group {
		return this.usernameField;
	}

	getPasswordField(): Konva.Group {
		return this.passwordField;
	}
}