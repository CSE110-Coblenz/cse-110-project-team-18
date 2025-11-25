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

		this.view = new PerformanceDashboardView(() => this.switcher.switchToScreen({ type: 'menu' }));
		this.model = new PerformanceDashboardModel();
	}

	// must implement getView()
	getView(): PerformanceDashboardView {
		return this.view;
	}

	override show(): void {
		super.show();
		// Load data every time screen opens
		const data = this.model.getAccuracyData();
		this.view.render(data);

		// Bring to top if needed
		this.view.getGroup().moveToTop();
	}

	override hide(): void {
		super.hide();
	}
}
