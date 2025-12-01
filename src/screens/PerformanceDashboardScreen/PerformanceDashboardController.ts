import { ScreenController, type ScreenSwitcher } from '../../types';
import { PerformanceDashboardView } from './PerformanceDashboardView';
import { PerformanceDashboardModel } from './PerformanceDashboardModel';

export class PerformanceDashboardController extends ScreenController {
	private view: PerformanceDashboardView;
	private model: PerformanceDashboardModel;
	private switcher: ScreenSwitcher;

	constructor(switcher: ScreenSwitcher) {
		super();
		this.switcher = switcher;

		this.view = new PerformanceDashboardView(() => {
			this.switcher.switchToScreen({ type: 'level selection' });
		});

		this.model = new PerformanceDashboardModel();
	}

	getView(): PerformanceDashboardView {
		return this.view;
	}

	override show(): void {
		super.show();

		// Load fresh data every time dashboard opens
		const data = this.model.getGameData();
		this.view.render(data);

		this.view.getGroup().moveToTop();
	}

	override hide(): void {
		super.hide();
		this.view.clear();
	}
}
