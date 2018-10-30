import { EventEmitter, Injectable } from '@angular/core';
import { DiceNames, GameStatus } from './../slot/slot-state/config'

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
    if (this.gameStatus === GameStatus.Finished) {
      this.multiplier = Math.floor(Math.random() * 10);
      const diceIndex = Math.floor(DiceNames.length * Math.random());
      this.winItem = DiceNames[diceIndex];
      this.score = Math.random();
      this.lastWinning = this.score;
    }
    this.gameStatusChanged.emit(status);
  }


}
