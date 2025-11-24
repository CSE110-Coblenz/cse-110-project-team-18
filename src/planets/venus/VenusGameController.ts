import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { VenusGameView } from './VenusGameView';
import { VenusGameModel } from './VenusGameModel';
import { theme } from '../../configs/ThemeConfig.ts';

export class VenusGameController extends ScreenController {
    private readonly screenSwitcher: ScreenSwitcher;
    private readonly view: VenusGameView;
    private readonly model: VenusGameModel;
    private inputBox: HTMLInputElement | null = null;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new VenusGameModel();
        this.view = new VenusGameView(
            () => this.handleSubmitAnswer(),
            () => this.handleReturnToMenuClick()
        );
    }

    getView(): VenusGameView {
        return this.view;
    }

    override show(): void {
        super.show();
        this.model.reset();
        this.ensureInputBox();
        this.presentCurrentQuestion();
    }

    override hide(): void {
        super.hide();
        this.removeInputBox();
    }

    update(_deltaTime: number): void {
        
    }

    private handleReturnToMenuClick(): void {
        this.screenSwitcher.switchToScreen({ type: 'menu' });
    }

    private ensureInputBox(): void {
        if (this.inputBox) {
            this.inputBox.value = '';
            this.focusInput();
            return;
        }

        const container = document.getElementById('container');
        if (!container) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter your answer';
        
        Object.assign(input.style, {
            position: 'absolute',
            width: '320px',
            padding: '12px',
            fontSize: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: '10',
            left: `${STAGE_WIDTH / 2 - 160}px`,
            top: `${STAGE_HEIGHT - 230}px`,
            
            background: '#1f2937', 
            color: 'white',        
            border: '2px solid white', 
        });

        input.style.outline = 'none';

        container.style.position = 'relative';
        container.appendChild(input);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleSubmitAnswer();
            }
        });

        this.inputBox = input;
        this.focusInput();
    }

    private focusInput(): void {
        this.inputBox?.focus();
    }

    private removeInputBox(): void {
        if (!this.inputBox) return;
        this.inputBox.remove();
        this.inputBox = null;
    }

    private presentCurrentQuestion(): void {
        if (!this.model.hasMoreQuestions()) return;
        const question = this.model.getCurrentQuestion();
        if (!question) return;
        this.view.displayQuestion(
            this.model.getCurrentQuestionIndex(),
            this.model.getTotalQuestions(),
            `${question.text} = ?`
        );
        this.focusInput();
    }

    private handleSubmitAnswer(): void {
        if (!this.inputBox) return;
        if (!this.model.hasMoreQuestions()) {
            this.view.showMessage('All questions answered! Review your summary.');
            return;
        }

        const rawInput = this.inputBox.value.trim();
        if (rawInput.length === 0) {
            this.view.showMessage('Please enter a number before submitting.', theme.get('warning'));
            this.focusInput();
            return;
        }

        const parsedAnswer = Number(rawInput);
        if (!Number.isFinite(parsedAnswer)) {
            this.view.showMessage('Answers need to be numbers.', theme.get('error'));
            this.focusInput();
            return;
        }

        const question = this.model.getCurrentQuestion();
        if (!question) return;
        const result = this.model.submitAnswer(parsedAnswer);

        this.view.displayResult(result.isCorrect, question.text, result.correctAnswer);
        this.inputBox.value = '';

        if (this.model.hasMoreQuestions()) {
            window.setTimeout(() => this.presentCurrentQuestion(), 1200);
        } else {
            const summary = this.model.getSummary();
            this.view.displaySummary(
                summary.correctAnswers,
                summary.totalQuestions,
                summary.minNumberOfQuestionsToWin
            );
            this.removeInputBox();
        }
    }
}