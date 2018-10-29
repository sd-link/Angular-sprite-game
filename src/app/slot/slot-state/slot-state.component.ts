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
  tweenTestCenter: any;
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

      /* tween-text-center */
      this.tweenTestCenter = PIXI.tweenManager.createTween(this.textCenter);
  ​    this.tweenTestCenter.repeat = 1;
      this.tweenTestCenter.on('start', () => { console.log('tween started') });


      // Animate main things
      this.app.ticker.add(() => {
        PIXI.tweenManager.update();
        this.backgroundAlphaStep = (this.imgBackground.alpha + this.backgroundAlphaStep > 1.0 || this.imgBackground.alpha + this.backgroundAlphaStep < 0.6) ? -this.backgroundAlphaStep : this.backgroundAlphaStep;
        this.imgBackground.alpha += this.backgroundAlphaStep;
      });
    });
  }

  play() {
    this.spriteRolling.gotoAndPlay(1);
    this.spriteRolling.alpha = 1.0;
   
    this.tweenTestCenter.from({ y: this.app.screen.height / 2 + 100, alpha: 0.0 }).to({ y: this.app.screen.height / 2, alpha: 1.0 })
    this.tweenTestCenter.time = 1000;

    this.tweenTestCenter.start();
  }

}
