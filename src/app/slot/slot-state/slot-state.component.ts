import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { SlotService } from './../slot.service';
import { DiceNames, FallingDices, AnimationTiming } from './config';

declare var PIXI: any;
declare var tweenManager: any;

@Component({
  selector: 'app-slot-state',
  templateUrl: './slot-state.component.html',
  styleUrls: ['./slot-state.component.css']
})
export class SlotStateComponent implements OnInit, OnDestroy {
  public app: any;

  subscription: any;
  
  readyAssets: boolean;
  spriteRolling: any;
  spriteDices: any[];
  tweenSpriteDices: any[];
  
  
  imgBackground: any;
  textCenter: any;
  tweenTextCenterIn: any;
  tweenTextCenterOut: any;
  tweenTextCenterChange: any;
  timer: any[];
  backgroundAlphaStep: number;
  typeAnimation: number; 
  score: number;
  
  @ViewChild('wrapper') wrapper: ElementRef;

  constructor(public slotService: SlotService) {
    this.subscription = this.slotService.gameStatusChanged.subscribe(status => this.gameStatusChange(status));
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  ngOnInit() {
    this.app = new PIXI.Application({
      width: 320,         
      height: 320,        
      antialias: true,    
      transparent: false, 
      resolution: 1       
    });
    this.wrapper.nativeElement.appendChild(this.app.view);
    this.readyAssets = false;
    this.timer = [];

    PIXI.loader
      .add('assets/slots/sprites/dice-flow-sheet.json')
      .add('assets/slots/sprites/dices-sheet.json')
      .load((loader, resources) => {
        this.readyAssets = true;
        this.backgroundAlphaStep = .01;

        /* sprite rolling */
        let frames = [];
        for (let i = 0; i < 58; i++) {
          let val = i < 10 ? '0' + i : i;
    ​      frames.push(PIXI.Texture.fromFrame('Square_000' + val));
        }
        this.spriteRolling = new PIXI.extras.AnimatedSprite(frames);
        this.spriteRolling.animationSpeed = 0.5;
        this.spriteRolling.x = 0;
        this.spriteRolling.y = 0;
        this.spriteRolling.loop = false;
        this.spriteRolling.onComplete = () => {
          this.spriteRolling.stop();
          this.spriteRolling.alpha = 0.0;
        };
      
        this.app.stage.addChild(this.spriteRolling);

        /* sprite dice */
        let frameDices = [];
        this.spriteDices = [];
        this.tweenSpriteDices = [];
        for (let i = 0; i < DiceNames.length; i++) {
          const diceName = DiceNames[i];
          frameDices.push(PIXI.Texture.fromFrame(diceName));
        }
        for (let i = 0; i < FallingDices; i++) {
          this.spriteDices[i] = new PIXI.extras.AnimatedSprite(frameDices);
          this.spriteDices[i].y = -320;
          this.spriteDices[i].anchor.set(0.5);
          this.tweenSpriteDices[i] = PIXI.tweenManager.createTween(this.spriteDices[i]);
          this.tweenSpriteDices[i].time = 100;
          this.app.stage.addChild(this.spriteDices[i]);
        }

        /* background */
        this.imgBackground = new PIXI.Sprite(PIXI.Texture.fromFrame('background'));
        this.imgBackground.x = 0;
        this.imgBackground.y = 0;
        this.app.stage.addChild(this.imgBackground);

        /* text-center */
        let style = new PIXI.TextStyle({
            fontFamily: 'EnzoOT-Bold',
            fontSize: 70,
            fill: '#ffffff',
            align: 'center',
            dropShadow: true,
            dropShadowColor: '#ffffff',
            dropShadowBlur: 10,
            dropShadowAngle: 0,
            dropShadowDistance: 0
        });

        this.textCenter = new PIXI.Text('PLAY!', style);
        this.textCenter.x = this.app.screen.width / 2;
        this.textCenter.y = this.app.screen.height / 2;
        this.textCenter.anchor.set(0.5);
        this.app.stage.addChild(this.textCenter);
        this.textCenter.alpha = 0.0;

        /* tween-text-center */
        this.tweenTextCenterIn = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterIn.time = AnimationTiming.TextIn;
        this.tweenTextCenterIn
          .from({ y: this.app.screen.height / 2 + 50, alpha: 0.0 })
          .to({ y: this.app.screen.height / 2, alpha: 1.0 })
        
        this.tweenTextCenterOut = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterOut.time = AnimationTiming.TextOut;
        this.tweenTextCenterOut
          .from({ y: this.app.screen.height / 2, alpha: 1.0 })
          .to({ y: this.app.screen.height / 2 - 50, alpha: 0.0 })

        this.tweenTextCenterChange = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterChange.time = AnimationTiming.TextCounting;
        this.tweenTextCenterChange.on('update', (progress, estimateTime) => { 
          switch(this.typeAnimation) {
            case 2:
              const txt = `${(this.score * progress).toFixed(9)} BTC`;
              this.textCenter.text = txt;
              break;
            default:
          }
        });

        // Animate main things
        this.app.ticker.add(() => {
          PIXI.tweenManager.update();
          this.backgroundAlphaStep = (this.imgBackground.alpha + this.backgroundAlphaStep > 1.0 || this.imgBackground.alpha + this.backgroundAlphaStep < 0.55) ? -this.backgroundAlphaStep : this.backgroundAlphaStep;
          this.imgBackground.alpha += this.backgroundAlphaStep;
        });
      });
  }

  playAnimation() {
    this.initializeTimer();
    this.typeAnimation = 0;
    this.textCenter.style.fontSize = 70;
    this.textCenter.text = 'PLAY!'
    this.spriteRolling.gotoAndPlay(1);
    this.spriteRolling.alpha = 1.0;
    this.tweenTextCenterIn.start();
    
    this.timer[0] = setTimeout(() => {
      this.tweenTextCenterOut.start();
      this.timer[0] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextDelay);
  }

  multiplierAnimation() {
    const { multiplier, winItem } = this.slotService;
    this.initializeTimer();
    this.typeAnimation = 1;
    this.textCenter.style.fontSize = 70;
    this.textCenter.text = `X${multiplier < 10 ? '0' + multiplier : multiplier}`;
    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterIn.start();

    
    let diceIndex = 0;
    for (let i = 0; i < DiceNames.length; i ++) {
      
      if (DiceNames[i] === winItem) {
        
        diceIndex = i; 
        break;
      }
    }

    for (let i = 0; i < FallingDices; i ++) {
      this.spriteDices[i].gotoAndStop(diceIndex);
      const scale = Math.random() / 3.0 + 0.4;
      this.spriteDices[i].scale = {x: scale, y: scale};
      this.spriteDices[i].x = 30 + Math.random() * 260;

      this.timer[i] = setTimeout(() => {
        this.tweenSpriteDices[i]
          .from({y: - 30}) 
          .to({y: 320 + 80})
          .time = (1 - scale) * AnimationTiming.DiceFallingDuration;
        this.tweenSpriteDices[i].start();
        this.timer[i] = null;
        
      }, i * AnimationTiming.DiceFallingInterval);

    }

    this.timer[FallingDices] = setTimeout(() => {
      this.tweenTextCenterOut.start();
      this.timer[FallingDices] = null;
    }, FallingDices * AnimationTiming.DiceFallingInterval);

    this.timer[FallingDices + 1] = setTimeout(() => {
      this.scoreAnimation();
      this.timer[FallingDices + 1] = null;
    }, FallingDices * AnimationTiming.DiceFallingInterval + AnimationTiming.TextOut);

  }

  scoreAnimation() {
    this.initializeTimer();
    this.score = this.slotService.score;
    this.typeAnimation = 2;
    this.textCenter.style.fontSize = 27;
    this.textCenter.text = `${(0).toFixed(9)} BTC`;
    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterIn.start();
    
    this.timer[0] = setTimeout(() => {
      this.tweenTextCenterChange.start();
      this.timer[0] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextDelay);

    this.timer[1] = setTimeout(() => {
      this.tweenTextCenterOut.start();
      this.timer[1] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextCounting + AnimationTiming.TextDelay * 2);

    this.timer[2] = setTimeout(() => {
      this.lastWinnigAnimation();
      this.timer[2] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextCounting + AnimationTiming.TextDelay * 2 + AnimationTiming.TextOut);
  }

  lastWinnigAnimation() {
    this.initializeTimer();
    this.typeAnimation = 3;
    this.textCenter.style.fontSize = 27;
    this.textCenter.text = `Last Winning \n ${this.slotService.lastWinning.toFixed(2)} BTC`;
    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterIn.start();
    
    this.timer[0] = setTimeout(() => {
      this.tweenTextCenterOut.start();
      this.timer[0] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextDelay);
  }
  
  initializeTimer() {
    for (let i = 0; i < this.timer.length; i ++) {
      if (this.timer[i]) {
        clearTimeout(this.timer[i]);
        this.timer[i] = null;
      }
    }

  }

  gameStatusChange(status) {
    if (status === 'play') {
      this.playAnimation();
    } else if (status === 'finished') {
      this.multiplierAnimation();
    }
  }

  setPlayStatus(status) {
    this.slotService.setGameStatus(status);
  }


}
