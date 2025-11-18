import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { KnowledgeScreenView } from './KnowledgeScreenView';
import { KnowledgeScreenModel } from './KnowledgeScreenModel';

export class KnowledgeScreenController extends ScreenController {
	private view: KnowledgeScreenView;
	private model: KnowledgeScreenModel;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.model = new KnowledgeScreenModel();

		this.view = new KnowledgeScreenView(
			() => this.handleNextSlide(),
			() => this.handleTestKnowledge(),
			() => this.handleReturnToMenu()
		);
	}

	private renderCurrent(): void {
		const slide = this.model.getCurrentSlide();
		this.view.renderSlide(slide, true);
	}

	private handleNextSlide(): void {
		this.screenSwitcher.switchToScreen({ type: 'earth' });
	}

	private handleTestKnowledge(): void {
		this.screenSwitcher.switchToScreen({ type: 'military time game' });
	}

	private handleReturnToMenu(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	override show(): void {
		super.show();
		this.view.show();
		this.renderCurrent();
	}

	override hide(): void {
		super.hide();
		this.view.hide();
	}

	override getView() {
		return this.view;
	}
}
