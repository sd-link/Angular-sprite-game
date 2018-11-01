import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { SlotService } from './../slot.service';
import { DiceNames, FallingDices, AnimationTiming, GameStatus, TextStyle, GameText } from './config';

declare var PIXI: any;
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
  tweenTextCenterSlideIn: any;
  tweenTextCenterSlideOut: any;
  tweenTextCenterZoomIn: any;
  tweenTextCenterZoomOut: any;
  tweenTextCenterChange: any;
  timer: any[];
  backgroundAlphaStep: number;
  typeAnimation: number; 
  score: number;

  ghostElement: any;
  
  @ViewChild('wrapper') wrapper: ElementRef;

  constructor(public slotService: SlotService) {
    this.addGhostFontElement();
    this.subscription = this.slotService.gameStatusChanged.subscribe(status => this.gameStatusChange(status));
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.removeGhostFontElement();
    this.initializeTimer();
    this.app.ticker.remove(this.updateTicker);
    
    this.tweenTextCenterChange.off('update', this.onTweenTextCenterChange);
    this.tweenTextCenterChange.clear();
    this.tweenTextCenterChange = null;
    this.tweenTextCenterSlideOut.clear();
    this.tweenTextCenterSlideOut = null;
    this.tweenTextCenterSlideIn.clear();
    this.tweenTextCenterSlideIn = null;
    this.tweenTextCenterZoomOut.clear();
    this.tweenTextCenterZoomOut = null;
    this.tweenTextCenterZoomIn.clear();
    this.tweenTextCenterZoomIn = null;
    
    this.textCenter.destroy();
    this.textCenter = null;
    this.imgBackground.destroy();
    this.imgBackground = null;
    this.spriteRolling.destroy();
    this.spriteRolling = null;
    
    for (let i = 0; i < this.spriteDices.length; i ++) {
      this.tweenSpriteDices[i].clear();
      this.tweenSpriteDices[i] = null;
      this.spriteDices[i].destroy();
      this.spriteDices[i] = null;
    }
    PIXI.loader.reset();
  }

  ngOnInit() {
    this.app = new PIXI.Application({
      width: 300,         
      height: 250,        
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
        this.spriteRolling.x = this.app.screen.width / 2;
        this.spriteRolling.y = this.app.screen.height / 2;
        this.spriteRolling.anchor.set(0.5);
        this.spriteRolling.loop = false;
        this.spriteRolling.onComplete = () => {
          if (this.spriteRolling) {
            this.spriteRolling.stop();
            this.spriteRolling.alpha = 0.0;
          }
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
          this.spriteDices[i].y = -this.app.screen.height;
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
            fontFamily: TextStyle.fontFamily,
            fontSize: TextStyle.fontSizeLarge,
            fill: '#ffffff',
            align: 'center',
            dropShadow: true,
            dropShadowColor: '#ffffff',
            dropShadowBlur: 10,
            dropShadowAngle: 0,
            dropShadowDistance: 0
        });

        this.textCenter = new PIXI.Text('!', style);
        this.app.stage.addChild(this.textCenter);
        this.textCenter.alpha = 0.0;

        /* tween-text-center */
        this.tweenTextCenterSlideIn = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterSlideIn.time = AnimationTiming.TextIn;
        this.tweenTextCenterSlideIn
          .from({ y: this.app.screen.height / 2 + 50, alpha: 0.0 })
          .to({ y: this.app.screen.height / 2, alpha: 1.0 })
        
        this.tweenTextCenterSlideOut = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterSlideOut.time = AnimationTiming.TextOut;
        this.tweenTextCenterSlideOut
          .from({ y: this.app.screen.height / 2, alpha: 1.0 })
          .to({ y: this.app.screen.height / 2 - 50, alpha: 0.0 })

        this.tweenTextCenterZoomIn = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterZoomIn.time = AnimationTiming.TextIn;
        this.tweenTextCenterZoomIn
          .from({ scale: {x: 1.2, y: 1.2}, alpha: 0.0 })
          .to({ scale: {x: 1, y: 1}, alpha: 1.0 })
        
        this.tweenTextCenterZoomOut = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterZoomOut.time = AnimationTiming.TextOut;
        this.tweenTextCenterZoomOut
          .from({ scale: {x: 1, y: 1}, alpha: 1.0 })
          .to({ scale: {x: 0.7, y: 0.7}, alpha: 0.0 })

        this.tweenTextCenterChange = PIXI.tweenManager.createTween(this.textCenter);
        this.tweenTextCenterChange.time = AnimationTiming.TextCounting;
        this.tweenTextCenterChange.on('update', this.onTweenTextCenterChange);
        
        // Animate main things
        this.app.ticker.add(this.updateTicker);
      });
  }

  updateTicker = () => {
    PIXI.tweenManager.update();
    this.backgroundAlphaStep = (this.imgBackground.alpha + this.backgroundAlphaStep > 1.0 || this.imgBackground.alpha + this.backgroundAlphaStep < 0.55) ? -this.backgroundAlphaStep : this.backgroundAlphaStep;
    this.imgBackground.alpha += this.backgroundAlphaStep;
    if (this.slotService.gameStatus === GameStatus.Play && this.spriteRolling.currentFrame >= 27) {
      this.spriteRolling.gotoAndPlay(23);
    }    
  }

  onTweenTextCenterChange = (progress, estimateTime) => { 
    switch(this.typeAnimation) {
      case 2:
      this.textCenter.text = `${(this.score * progress).toFixed(9)} ${GameText.BTC}`;
        break;
      default:
    }
  }

  playAnimation() {
    this.initializeTimer();
    this.typeAnimation = 0;

    this.textCenter.scale = {x: 1.0, y: 1.0};
    this.textCenter.text = GameText.Play;
    this.textCenter.style.fontSize = TextStyle.fontSizeLarge;
    this.centerText();

    this.spriteRolling.gotoAndPlay(1);
    this.spriteRolling.alpha = 1.0;
    this.tweenTextCenterSlideIn.start();
  }

  multiplierAnimation() {
    const { multiplier, winItem } = this.slotService;
    this.initializeTimer();
    this.typeAnimation = 1;
    
    this.textCenter.scale = {x: 1.0, y: 1.0};
    this.textCenter.text = `X${multiplier < 10 ? '0' + multiplier : multiplier}`;
    this.textCenter.style.fontSize = TextStyle.fontSizeLarge;
    this.centerText();

    this.tweenTextCenterSlideIn.start();

    for (let i = 0; i < FallingDices; i ++) {
      this.spriteDices[i].gotoAndStop(winItem);
      const scale = Math.random() / 3.0 + 0.4;
      this.spriteDices[i].scale = {x: scale, y: scale};
      this.spriteDices[i].x = 30 + Math.random() * 260;

      this.timer[i] = setTimeout(() => {
        this.tweenSpriteDices[i]
          .from({y: - 30}) 
          .to({y: this.app.screen.width + 80})
          .time = (1 - scale) * AnimationTiming.DiceFallingDuration;
        this.tweenSpriteDices[i].start();
        clearTimeout(this.timer[i]);
        this.timer[i] = null;
        
      }, i * AnimationTiming.DiceFallingInterval);

    }

    this.timer[FallingDices] = setTimeout(() => {
      this.tweenTextCenterSlideOut.start();
      this.timer[FallingDices] = null;
    }, FallingDices * AnimationTiming.DiceFallingInterval);

    this.timer[FallingDices + 1] = setTimeout(() => {
      this.scoreAnimation();
      clearTimeout(this.timer[FallingDices + 1]);
      this.timer[FallingDices + 1] = null;
    }, FallingDices * AnimationTiming.DiceFallingInterval + AnimationTiming.TextOut);

  }

  scoreAnimation() {
    this.initializeTimer();
    this.score = this.slotService.score;
    this.typeAnimation = 2;
    this.textCenter.style.fontSize = TextStyle.fontSizeSmall;
    this.textCenter.text = `${(0).toFixed(9)} ${GameText.BTC}`;
    this.centerText();

    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterSlideIn.start();
    
    this.timer[0] = setTimeout(() => {
      this.tweenTextCenterChange.start();
      clearTimeout(this.timer[0]);
      this.timer[0] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextDelay);

    this.timer[1] = setTimeout(() => {
      this.tweenTextCenterSlideOut.start();
      clearTimeout(this.timer[1]);
      this.timer[1] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextCounting + AnimationTiming.TextDelay * 2);

    this.timer[2] = setTimeout(() => {
      this.lastWinnigAnimation();
      clearTimeout(this.timer[2]);
      this.timer[2] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextCounting + AnimationTiming.TextDelay * 2 + AnimationTiming.TextOut);
  }

  lastWinnigAnimation() {
    this.initializeTimer();
    this.typeAnimation = 3;
    
    this.textCenter.scale = {x: 1.0, y: 1.0};
    this.textCenter.text = `${GameText.LastWinning} \n ${this.slotService.lastWinning.toFixed(2)} ${GameText.BTC}`;
    this.textCenter.style.fontSize = TextStyle.fontSizeSmall;
    this.centerText();

    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterSlideIn.start();
    
    this.timer[0] = setTimeout(() => {
      this.tweenTextCenterSlideOut.start();
      clearTimeout(this.timer[0]);
      this.timer[0] = null;
    }, AnimationTiming.TextIn + AnimationTiming.TextDelay);
  }

  failAnimation() {
    this.initializeTimer();
    this.typeAnimation = 0;

    this.textCenter.scale = {x: 1.0, y: 1.0};
    this.textCenter.text = GameText.TryAgain;
    this.textCenter.style.fontSize = TextStyle.fontSizeMedium;
    this.centerText();
   
    this.tweenTextCenterZoomIn.start();

    this.timer[0] = setTimeout(() => {
      this.tweenTextCenterZoomOut.start();
      this.textCenter.scale = {x: 1.0, y: 1.0}
      clearTimeout(this.timer[0]);
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

  disapearPlay() {
    this.initializeTimer();
    if (this.textCenter.text === GameText.Play) {
      this.tweenTextCenterSlideOut.start();
    }
  }

  gameStatusChange(status) {
    if (status === GameStatus.Play) {
      this.timer[FallingDices + 2] = setTimeout(() => {
        clearTimeout(this.timer[FallingDices + 2]);
        this.timer[FallingDices + 2] = null;
        this.playAnimation();
      }, AnimationTiming.TextOut + AnimationTiming.TextDelay);
    } else if (status === GameStatus.Success) {
      this.disapearPlay();
      this.timer[FallingDices + 2] = setTimeout(() => {
        clearTimeout(this.timer[FallingDices + 2]);
        this.timer[FallingDices + 2] = null;
        this.multiplierAnimation();
      }, AnimationTiming.TextOut + AnimationTiming.TextDelay);
    } else if (status === GameStatus.Fail) {
      this.disapearPlay();
      this.timer[FallingDices + 2] = setTimeout(() => {
        clearTimeout(this.timer[FallingDices + 2]);
        this.timer[FallingDices + 2] = null;
        this.failAnimation();
      }, AnimationTiming.TextOut + AnimationTiming.TextDelay);
    } 
  }

  centerText() {
    this.textCenter.x = this.app.screen.width / 2;
    this.textCenter.y = this.app.screen.height / 2;
    this.textCenter.anchor.set(0.5);
  }

  addGhostFontElement() {
    this.ghostElement = document.createElement('p');
    this.ghostElement.style.fontFamily = TextStyle.fontFamily;
    this.ghostElement.style.fontSize = "0px";
    this.ghostElement.style.visibility = "hidden";
    this.ghostElement.innerHTML = '.';
    document.body.appendChild(this.ghostElement);
  };

  removeGhostFontElement() {
    if (this.ghostElement) {
      document.body.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }

  play() {
    this.slotService.setGameStatus(GameStatus.Play);
  }

  success() {
    this.slotService.setGameStatus(GameStatus.Success);
  }

  fail() {
    this.slotService.setGameStatus(GameStatus.Fail);
  }
}
