import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig.ts';

/**
 * Manages all Konva UI elements for the Prime Number Game.
 */
export class PrimeNumberGameView implements View {
    private group: Konva.Group;

    // UI Elements
    private scoreDisplay: Konva.Text;
    private questionNumber: Konva.Text;
    private questionText: Konva.Text;
    private feedbackText: Konva.Text;
    
    private yesButton: Konva.Group;
    private noButton: Konva.Group;

    constructor() {
        this.group = new Konva.Group({
            visible: false,
            id: 'primeNumberGameScreen',
        });
        
        // Score Number
        this.scoreDisplay = new Konva.Text({
            x: 20,
            y: 30,
            text: 'Score: 0',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: 'white',
        });
        
        // Question Number
        this.questionNumber = new Konva.Text({
            x: STAGE_WIDTH - 190,
            y: 30,
            text: 'Question: 1 / 10',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: 'white',
        });

        // Question Text 
        this.questionText = new Konva.Text({
            x: 50,
            y: 150,
            width: STAGE_WIDTH - 100, // Wrap text
            text: 'Is 17 a prime number?',
            fontSize: 32,
            fontFamily: 'Arial',
            fill: 'white',
            align: 'center',
            padding: 20,
        });

        // Feedback Text
        this.feedbackText = new Konva.Text({
            x: 50,
            y: 250,
            width: STAGE_WIDTH - 100,
            text: ' ',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: 'white',
            align: 'center',
        });

        // Buttons
        this.yesButton = this.createAnswerButton('Yes', STAGE_WIDTH / 2 - 160, 400);
        this.noButton = this.createAnswerButton('No', STAGE_WIDTH / 2 + 10, 400);

        this.group.add(this.scoreDisplay);
        this.group.add(this.questionNumber);
        this.group.add(this.questionText);
        this.group.add(this.feedbackText);
        this.group.add(this.yesButton);
        this.group.add(this.noButton);
    }
    
    /**
     * Helper function to create a Konva button
     */
    private createAnswerButton(text: string, x: number, y: number): Konva.Group {
        const buttonGroup = new Konva.Group({ x, y });
        
        const buttonRect = new Konva.Rect({
            width: 150,
            height: 60,
            fill: '#00D1B2',
            cornerRadius: 8,
            shadowColor: 'black',
            shadowBlur: 5,
            shadowOffsetY: 3,
        });
        
        const buttonText = new Konva.Text({
            text: text,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: 'white',
            width: 150,
            height: 60,
            align: 'center',
            verticalAlign: 'middle',
        });

        buttonGroup.add(buttonRect, buttonText);
        
        buttonGroup.on('mouseenter', () => {
            buttonRect.fill('#00B89C');
            this.group.getStage()!.container().style.cursor = 'pointer';
        });
        buttonGroup.on('mouseleave', () => {
            buttonRect.fill('#00D1B2');
            this.group.getStage()!.container().style.cursor = 'default';
        });
        
        return buttonGroup;
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
        this.questionText.text(questionText);
        this.questionNumber.text(`Question: ${index + 1} / ${total}`);
        this.feedbackText.text(' ');
        this.setAnswerButtonsDisabled(false);
    }

    public updateScore(newScore: number): void {
        this.scoreDisplay.text(`Score: ${newScore}`);
    }
    
    public displayFeedback(isCorrect: boolean): void {
        this.setAnswerButtonsDisabled(true);
        if (isCorrect) {
            this.feedbackText.text('Correct!');
            this.feedbackText.fill('lightgreen');
        } else {
            this.feedbackText.text(`Incorrect!`);
            this.feedbackText.fill('lightcoral');
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