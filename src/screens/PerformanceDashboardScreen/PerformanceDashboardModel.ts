import { ProgressStore } from '../../core/managers/ProgressStore';

export class PerformanceDashboardModel {
	getAccuracyData() {
		const store = ProgressStore.getInstance();

		return [
			{
				topic: 'Earth Time Arithmetic',
				accuracy: store.getAccuracy('Earth Time Arithmetic'),
			},
			{
				topic: 'Mercury Math',
				accuracy: store.getAccuracy('Mercury Math'),
			},
			{
				topic: 'Prime Number Game',
				accuracy: store.getAccuracy('Prime Number Game'),
			},
			{
				topic: 'Venus Math Mission',
				accuracy: store.getAccuracy('Venus Math Mission'),
			},
			{
				topic: 'Asteroid Field',
				accuracy: store.getAccuracy('Asteroid Field'),
			},
		];
	}
}
