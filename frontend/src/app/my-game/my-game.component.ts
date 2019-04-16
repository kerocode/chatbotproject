import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { PredictionService } from '../prediction.service';
import { trigger, state, style, transition, animate, } from '@angular/animations';

enum Status {
  ShowImage = 0,
  ShowButton = 1,
  ShowProgress = 2,
  ShowResult = 3
}
enum GameResult {
  Com = 0,
  User = 1,
  Draw = 2,
  None = 3
}
@Component({
  selector: 'app-my-game',
  templateUrl: './my-game.component.html',
  styleUrls: ['./my-game.component.css'],
  animations: [
    trigger('enterTrigger', [
      state('fadeIn', style({
        opacity: '1',
      })),
      transition('*=>fadeIn', [style({ opacity: '0' }), animate('300ms')])
    ]),
    trigger('checkMark', [
      state(':done', style({
        transform: 'rotate(0deg) scale(1)'
      })),
      transition(':enter', [style({ transform: 'rotate(20deg) scale(1.2)' }), animate('500ms')])
    ]),
  ]
})
export class MyGameComponent implements OnInit {

  imagePath = ['CLL', 'FL', 'MCL'];
  currentStatus;
  userSelection: number;
  comSelection = 5;
  userScore = 0;
  comScore = 0;
  currentId: number;
  Status: typeof Status = Status;
  GameResult: typeof GameResult = GameResult;
  result: number;
  imageUrl: string;
  numbers = Array.from({ length: 10 }, (v, i) => i + 1);
  results = Array.from({ length: 10 }, (v, i) => i + 1);
  @ViewChildren('testObj') testObj: QueryList<HTMLImageElement>;
  @ViewChild('selectedImg') selectedImg: ElementRef<HTMLImageElement>;

  constructor(private predictionService: PredictionService) { }

  ngOnInit() {
  }

  randomSelection(): void {
    this.currentId = this.predictionService.randomNumber(this.imagePath.length);
    const labelName = this.imagePath[this.currentId];
    const imageName = this.predictionService.randomNumber(10) + 1;
    this.imageUrl = `assets/img/${labelName}/${imageName}.jpeg`;
    this.currentStatus = Status.ShowImage;
  }
  submitAnswer() {
    this.predictionService.predict(this.selectedImg.nativeElement).then(
      result => {
        this.comSelection = this.getLabelIndex(result);
        this.gameLogic();
      });
    // this.comSelection = this.predictionService.randomNumber(3);
  }

  private getLabelIndex(predictions: Array<number>): number {
    let key = 0;
    for (const pre of predictions) {
      if (predictions[key] < pre) {
        key++;
      }
    }
    return key;
  }
  private gameLogic() {
    if (Number(this.userSelection) === this.currentId && this.comSelection === this.currentId) {
      this.result = GameResult.Draw;
    } else if (Number(this.userSelection) === this.currentId) {
      this.userScore++;
      this.result = GameResult.User;
    } else if (this.comSelection === this.currentId) {
      this.comScore++;
      this.result = GameResult.Com;
    } else {
      this.result = GameResult.None;
    }
    this.currentStatus = Status.ShowResult;
  }

  playAgain() {
    this.randomSelection();
    this.comSelection = 5;
    this.userSelection = undefined;
  }
  quite() {
    this.userScore = 0;
    this.comScore = 0;
    this.comSelection = 5;
    this.currentStatus = Status.ShowButton;
    this.userSelection = undefined;
  }
  imgPath(labelName: string, n: number) {
    return `assets/img/${labelName}/${n}.jpeg`;
  }
  predictTest(t, n) {
    //const someimage = document.getElementById(n);
    // const myimg: ElementRef<HTMLImageElement> = someimage.getElementsByTagName('img')[0];
    this.predictionService.predict(t.currentTarget).then(
      result => {
        this.results[n] = this.getLabelIndex(result);
      });

    /*this.predictionService.predict(myimg.nativeElement).then(
       result => {
         this.comSelection = this.getLabelIndex(result);
         this.gameLogic();
       });*/
  }
}
