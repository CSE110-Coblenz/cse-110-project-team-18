import { PrimeNumberGameModel } from './PrimeNumberGameModel.ts';
import { PrimeNumberGameView } from './PrimeNumberGameView.ts';
import type { ScreenSwitcher, ScreenController } from '../../types.ts';

/**
 * Connects the Model and View. Handles user input.
 */
export class PrimeNumberGameController implements ScreenController {
    private model: PrimeNumberGameModel;
    private view: PrimeNumberGameView;
    private screenSwitcher: ScreenSwitcher;
    private numberOfQuestions: number = 10;
    
    constructor(switcher: ScreenSwitcher) {
        this.screenSwitcher = switcher;

        // Create its own model and view
        this.model = new PrimeNumberGameModel();
        this.view = new PrimeNumberGameView();
        
        // Bind view events to controller methods
        this.view.bindSubmitAnswer(this.handleSubmitAnswer.bind(this));
    }

    /**
     * Returns the main Konva.Group for this screen.
     */
    public getView(): PrimeNumberGameView {
        return this.view;
    }

    /**
     * Makes this screen's Konva.Group visible.
     */
    public show(): void {
        this.view.show();
    }

    /**
     * Makes this screen's Konva.Group invisible.
     */
    public hide(): void {
        this.view.hide();
    }

    /**
     * Main update loop, called by main.ts
     */
    public update(dt: number): void {

    }

    /**
     * Initializes and starts a new game session.
     */
    public async startGame(): Promise<void> {
        await this.model.start(this.numberOfQuestions);
        this.view.updateScore(0);
        
        this.showNextQuestion();
    }

    private handleSubmitAnswer(userInput: string): void {
        const result = this.model.submitAnswer(userInput);
        
        this.view.updateScore(result.newScore);
        this.view.displayFeedback(result.isCorrect);
        
        setTimeout(() => {
            if (result.isGameOver) {
                const { score } = this.model.getFinalScore();
                
                this.screenSwitcher.switchToScreen({ 
                    type: 'result', 
                    score: score 
                });
                
            } else {
                this.showNextQuestion();
            }
        }, 1500);
    }

    private showNextQuestion(): void {
        const question = this.model.getCurrentQuestion();
        if (question) {
            this.view.updateQuestion(
                question.text, 
                this.model.currentQuestionIndex, 
                this.model.totalQuestions
            );
        }
    }
}