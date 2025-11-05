// import Konva from 'konva';
// import type { View } from '../../types.ts';
// import { STAGE_WIDTH } from '../../configs/GameConfig';

// /**
//  * MenuScreenView - Renders the menu screen
//  */
// export class MenuScreenView implements View {
// 	private group: Konva.Group;
// 	private buttonGroup?: Konva.Group;

// 	/**
// 	 * Constructor for the MenuScreenView
// 	 * @param onStartClick - The function to call when the start button is clicked
// 	 */
// 	constructor(onAsteriodFieldClick: () => void) {
// 		this.group = new Konva.Group({
// 			visible: true,
// 			id: 'menuScreen', // Add ID for debugging
// 		});

// 		// Title text
// 		const title = new Konva.Text({
// 			x: STAGE_WIDTH / 2,
// 			y: 150,
// 			text: 'MATH EXPLORERS: GALACTIC QUEST',
// 			fontSize: 48,
// 			fontFamily: 'Arial',
// 			fill: 'white',
// 			align: 'center',
// 		});
// 		// Center the text using offsetX
// 		title.offsetX(title.width() / 2);
// 		this.group.add(title);

// 		// Asteroid Field Game Start Button
// 		const asteriodFieldButtonGroup = new Konva.Group({
// 			listening: true, // Explicitly enable listening for the button group
// 		});
// 		const asteriodFieldStartButton = new Konva.Rect({
// 			x: STAGE_WIDTH / 2 - 200,
// 			y: 375,
// 			width: 400,
// 			height: 60,
// 			fill: 'green',
// 			cornerRadius: 10,
// 			stroke: 'darkgreen',
// 			strokeWidth: 3,
// 			listening: true, // Ensure the rect itself listens to clicks
// 		});

// 		const asteriodFieldStartText = new Konva.Text({
// 			x: STAGE_WIDTH / 2,
// 			y: 390,
// 			text: 'START ASTEROID FIELD GAME',
// 			fontSize: 24,
// 			fontFamily: 'Arial',
// 			fill: 'white',
// 			align: 'center',
// 			listening: false,
// 		});
// 		asteriodFieldStartText.offsetX(asteriodFieldStartText.width() / 2);
// 		asteriodFieldButtonGroup.add(asteriodFieldStartButton);
// 		asteriodFieldButtonGroup.add(asteriodFieldStartText);
// 		asteriodFieldButtonGroup.on('click', onAsteriodFieldClick);
// 		this.buttonGroup = asteriodFieldButtonGroup;
// 		this.group.add(asteriodFieldButtonGroup);
// 		asteriodFieldButtonGroup.moveToTop();

// 		// Menu view intentionally stays passive about movement/assets.
// 		// Asset loading and movement are managed by the controller/manager.
// 	}

// 	/**
// 	 * Ensure buttons are always on top (call this after sprite loads)
// 	 */
// 	ensureButtonsOnTop(): void {
// 		if (this.buttonGroup) {
// 			this.buttonGroup.moveToTop();
// 		}
// 	}

// 	/**
// 	 * Show the screen
// 	 */
// 	show(): void {
// 		this.group.visible(true);
// 		this.group.getLayer()?.draw();
// 	}

// 	/**
// 	 * Hide the screen
// 	 */
// 	hide(): void {
// 		this.group.visible(false);
// 		this.group.getLayer()?.draw();
// 	}

// 	/**
// 	 * Get the group of the menu screen view
// 	 * @returns The group of the menu screen view
// 	 */
// 	getGroup(): Konva.Group {
// 		return this.group;
// 	}
// }

import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';

// NEW: use the factory
import { createButton } from '../../ui';

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
  private group: Konva.Group;
  private buttonGroup?: Konva.Group;

  /**
   * @param onAsteriodFieldClick - The function to call when the start button is clicked
   */
  constructor(onAsteriodFieldClick: () => void) {
    this.group = new Konva.Group({
      visible: true,
      id: 'menuScreen',
    });

    // Title text (unchanged)
    const title = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: 150,
      text: 'MATH EXPLORERS: GALACTIC QUEST',
      fontSize: 48,
      fontFamily: 'Arial',
      fill: 'white',
      align: 'center',
    });
    title.offsetX(title.width() / 2);
    this.group.add(title);

    // START button via factory
    const asteroidFieldBtn = createButton({
      // x defaults to STAGE_WIDTH / 2 - 200 per factory; pass x if you want a custom offset
      y: 375,
      width: 400,
      height: 60,
      text: 'START ASTEROID FIELD GAME',
      colorKey: 'alien_green',        // theme green
      hoverColorKey: 'success_hover',
    //   fontFamily: 'Georgia',        // keep your typography overrides
    //   fontSize: 24,
    //   fontWeight: 700,
      onClick: onAsteriodFieldClick,
    });

    this.buttonGroup = asteroidFieldBtn;
    this.group.add(asteroidFieldBtn);
    asteroidFieldBtn.moveToTop();

    // Menu view intentionally stays passive about movement/assets.
  }

  ensureButtonsOnTop(): void {
    if (this.buttonGroup) {
      this.buttonGroup.moveToTop();
    }
  }

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
}