import { EventEmitter, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SlotService {

  multiplier;
  winItem;
  score;
  lastWinning;
  gameStatus;
  
  gameStatusChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  setGameStatus(status) {
    this.gameStatus = status;
    if (this.gameStatus === 'finished') {
      this.multiplier = Math.floor(Math.random() * 10);
      this.winItem = 'bitcoin';
      this.score = Math.random();
      this.lastWinning = this.score;
    }
    this.gameStatusChanged.emit(status);
  }


}
