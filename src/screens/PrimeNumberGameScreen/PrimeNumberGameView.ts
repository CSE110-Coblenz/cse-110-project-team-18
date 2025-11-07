import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig.ts';
import { theme } from '../../configs/ThemeConfig.ts';
import { createButton, createTextBox, setElementText } from '../../ui/factory/ElementFactory.ts';

/**
 * Manages all Konva UI elements for the Prime Number Game.
 */
export class PrimeNumberGameView implements View {
    private group: Konva.Group;

    // UI Elements
    private scoreDisplay: Konva.Group;
    private questionNumber: Konva.Group;
    private questionText: Konva.Group;
    private feedbackText: Konva.Group;
    
    private yesButton: Konva.Group;
    private noButton: Konva.Group;

    constructor() {
        this.group = new Konva.Group({
            visible: false,
            id: 'primeNumberGameScreen',
        });
        
        // Score Number
        this.scoreDisplay = createTextBox({
            x: 20,
            y: 30,
            width: 150,
            height: 30,
            text: 'Score: 0',
            colorKey: 'surface_alt', 
            fontColorKey: 'text_inverse',
            fontSize: 20,
            padding: 5,
        }, theme);
        
        // Question Number
        this.questionNumber = createTextBox({
            x: STAGE_WIDTH - 200,
            y: 30,
            width: 180,
            height: 30,
            text: 'Question: 1 / 10',
            colorKey: 'surface_alt', 
            fontColorKey: 'text_inverse',
            fontSize: 20,
            padding: 5,
        }, theme);

        // Question Text 
        this.questionText = createTextBox({
            x: 50,
            y: 150,
            width: STAGE_WIDTH - 100,
            height: 150, 
            text: 'Is 17 a prime number?',
            colorKey: 'surface', 
            fontColorKey: 'text_inverse',
            fontSize: 32,
            padding: 20,
        }, theme);

        // Feedback Text
        this.feedbackText = createTextBox({
            x: 50,
            y: 320,
            width: STAGE_WIDTH - 100,
            height: 50,
            text: ' ',
            colorKey: 'transparent',
            fontColorKey: 'text_inverse', 
            fontSize: 24,
            padding: 10,
        }, theme);

        // Buttons
        this.yesButton = createButton({
            x: STAGE_WIDTH / 2 - 160,
            y: 400,
            width: 150,
            height: 60,
            text: 'YES',
            colorKey: 'primary',
            hoverColorKey: 'primary_hover',
        }, theme); 

        this.noButton = createButton({
            x: STAGE_WIDTH / 2 + 10,
            y: 400,
            width: 150,
            height: 60,
            text: 'NO',
            colorKey: 'error',
            hoverColorKey: 'error_hover',
        }, theme);

        this.group.add(this.scoreDisplay, this.questionNumber, this.questionText, 
                       this.feedbackText, this.yesButton, this.noButton);
    }

    public show(): void {
        this.group.visible(true);
    }

    public hide(): void {
        this.group.visible(false);
    }

    public getGroup(): Konva.Group {
        return this.group;
    }
    
    public updateQuestion(questionText: string, index: number, total: number): void {
        setElementText(this.questionText, questionText);
        setElementText(this.questionNumber, `Question: ${index + 1} / ${total}`);
        setElementText(this.feedbackText, ' '); 
        this.setAnswerButtonsDisabled(false);
    }

    public updateScore(newScore: number): void {
        setElementText(this.scoreDisplay, `Score: ${newScore}`);
    }
    
    public displayFeedback(isCorrect: boolean): void {
        this.setAnswerButtonsDisabled(true);
        const feedbackText = isCorrect ? 'Correct!' : `Incorrect!`;
        
        setElementText(this.feedbackText, feedbackText);
        
        const txt = this.feedbackText.findOne<Konva.Text>('Text');
        if (txt) {
            txt.fill(isCorrect ? theme.get('success') : theme.get('error'));
        }
    }

    public setAnswerButtonsDisabled(isDisabled: boolean): void {
        if (isDisabled) {
            this.yesButton.listening(false);
            this.noButton.listening(false);
            this.yesButton.opacity(0.5);
            this.noButton.opacity(0.5);
        } else {
            this.yesButton.listening(true);
            this.noButton.listening(true);
            this.yesButton.opacity(1);
            this.noButton.opacity(1);
        }
    }
    
    public bindSubmitAnswer(handler: (answer: string) => void): void {
        this.yesButton.on('click', () => { 
            handler('yes');
        });
        
        this.noButton.on('click', () => { 
            handler('no');
        });
    }
}