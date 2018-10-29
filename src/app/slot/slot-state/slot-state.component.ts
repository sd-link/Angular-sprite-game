import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

declare var PIXI: any;
declare var tweenManager: any;

@Component({
  selector: 'app-slot-state',
  templateUrl: './slot-state.component.html',
  styleUrls: ['./slot-state.component.css']
})
export class SlotStateComponent implements OnInit {
  public app: any;
  
  readyAssets: boolean;
  spriteRolling: any;
  imgBackground: any;
  textCenter: any;
  tweenTextCenterIn: any;
  tweenTextCenterOut: any;
  tweenTextCenterChange: any;
  timerPrimary: any;
  backgroundAlphaStep: number;

  @ViewChild('wrapper') wrapper: ElementRef;

  constructor() { }


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

    PIXI.loader
    .add('assets/slots/sprites/dice-flow-sheet.json')
    .add('background', 'assets/slots/pngs/background.png')
    .load((loader, resources) => {
      this.readyAssets = true;
      this.backgroundAlphaStep = .01;

      /* sprite */
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

      /* background */
      this.imgBackground = new PIXI.Sprite(resources.background.texture);
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
          dropShadowDistance: 0,
          wordWrap: true,
      });

      this.textCenter = new PIXI.Text('PLAY!', style);
      this.textCenter.x = this.app.screen.width / 2;
      this.textCenter.y = this.app.screen.height / 2;
      this.textCenter.anchor.set(0.5);
      this.app.stage.addChild(this.textCenter);
      this.textCenter.alpha = 0.0;

      /* tween-text-center */
      this.tweenTextCenterIn = PIXI.tweenManager.createTween(this.textCenter);
      this.tweenTextCenterIn.time = 400;
      this.tweenTextCenterIn
        .from({ y: this.app.screen.height / 2 + 50, alpha: 0.0 })
        .to({ y: this.app.screen.height / 2, alpha: 1.0 })
      
      this.tweenTextCenterOut = PIXI.tweenManager.createTween(this.textCenter);
      this.tweenTextCenterOut.time = 400;
      this.tweenTextCenterOut
        .from({ y: this.app.screen.height / 2, alpha: 1.0 })
        .to({ y: this.app.screen.height / 2 - 50, alpha: 0.0 })

      this.tweenTextCenterChange = PIXI.tweenManager.createTween(this.textCenter);
      this.tweenTextCenterChange.time = 1000;

      // Animate main things
      this.app.ticker.add(() => {
        PIXI.tweenManager.update();
        this.backgroundAlphaStep = (this.imgBackground.alpha + this.backgroundAlphaStep > 1.0 || this.imgBackground.alpha + this.backgroundAlphaStep < 0.6) ? -this.backgroundAlphaStep : this.backgroundAlphaStep;
        this.imgBackground.alpha += this.backgroundAlphaStep;
      });
    });
  }

  playAnimation() {
    this.textCenter.style.fontSize = 70;
    this.textCenter.text = 'PLAY!'
    this.spriteRolling.gotoAndPlay(1);
    this.spriteRolling.alpha = 1.0;
    this.tweenTextCenterIn.start();
    if (this.timerPrimary) {
      clearTimeout(this.timerPrimary);
    }
    this.timerPrimary = setTimeout(() => {
      this.tweenTextCenterOut.start();
      this.timerPrimary = null;
    }, 1100);
  }

  multiplierAnimation(xV) {
    this.textCenter.style.fontSize = 70;
    this.textCenter.text = `X${xV < 10 ? '0' + xV : xV}`;
    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterIn.start();
    if (this.timerPrimary) {
      clearTimeout(this.timerPrimary);
    }
    this.timerPrimary = setTimeout(() => {
      this.tweenTextCenterOut.start();
      this.timerPrimary = null;
    }, 1100);
  }

  scoreAnimation(xV) {
    
    const v1 = (1).toFixed(9);
    const v2 = xV.toFixed(9);    
    this.textCenter.style.fontSize = 24;
    this.textCenter.text = `${v1} BTC`;
    this.spriteRolling.alpha = 0.0;
    this.tweenTextCenterIn.start();
    if (this.timerPrimary) {
      clearTimeout(this.timerPrimary);
    }
    this.timerPrimary = setTimeout(() => {


      this.tweenTextCenterChange
        .from ({text:v1, alpha: 1.0})
        .to ({text:v2, alpha: 1.0})
      this.tweenTextCenterChange.start();
      this.timerPrimary = null;
      
    }, 600);
  }


}
