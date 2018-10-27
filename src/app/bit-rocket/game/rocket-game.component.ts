import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Bitmap, Container, Ease, Shape, Sprite, SpriteSheet, Stage, Ticker, Tween } from 'createjs-module';
import { forEach, keys } from 'lodash';
import { Images, RocketSpaces, RocketGameStatus, RocketTiming, Sprites, StageScale } from '../config';
import { BitRocketService } from '../../../services/bit-rocket/bit-rocket.service';

const { Init, Started, Launched, Crashed, AfterCrash } = RocketGameStatus;
const { ResetDalay, RocketLaunch } = RocketTiming;
const { Earth, Atmosphere, MoonApproach, Moon, RocketSplit, ToMarsText, ToMarsElon, MarsApproach, Mars, RocketRotating, SpaceAfterMars } = RocketSpaces;

@Component({
  selector: 'app-rocket-game',
  templateUrl: './rocket-game.component.html',
  styleUrls: ['./rocket-game.component.scss'],
})

export class RocketGameComponent implements OnInit, OnDestroy {
  stageMain: any;

  containers = {
    wrapper: null,
    launchBackground: null,
    silo: null,
    rocket: null,
    rocketAnimation: null,
    smoke: null,
    maskForSpread: null,
    toMars: null,
  };

  sprites = {
    siloRadar: null,
    rocketSmokeSpread: null,
    rocketSmokeCloud: null,
    rocketSplit: null,
    rocketMiniRotate: null,
    crashLaunch: null,
    crashMars: null,
    crashEarth: null,
    crashSpace: null,
    toMarsElon: null,
    toMarsText: null,
    trail: null,
    trailMini: null,
  };

  shapes = {
    maskForSpread: null,
    ground: null,
    siloLines: null,
    gradient: null,
  };

  bitmaps = {
    rocketFull: null,
    rocketMini: null,
    silo: null,
    mountain: null,
  };

  tickers = {
    rocketMiniRotate: null,
    rocketSplit: null,
    crashLaunch: null,
    crashEarth: null,
    crashSpace: null,
    crashMars: null,
    toMarsText: null,
    rocketSmokeCloud: null,
    rocketSmokeSpread: null,
  };

  tweens = {
    rocketSmokeSpread: null,
    launchBackground: null,
    silo: null,
    rocket: null,
    smoke: null,
    maskForSpread: null,
    siloLines: null,
    marsToMars: null,
  };

  stageTicker = null;

  isMiniRocket: boolean;
  isReady: boolean;
  is1stOnFrame: boolean;
  prevSpace: number;
  isPlaying: boolean;
  msgText: string;
  msgPlay: boolean;
  prevFrameOfSpread: number;
  minBackHeight: number;

  canvasMaxWidth: any = Images[0].width;
  gameStatus = RocketGameStatus;
  launchStarted = null;
  subscription = null;

  interval = null;
  timers = [];

  @Input() canvasWidth = 1000;
  @Input() canvasHeight = 700;
  @ViewChild('mainCanvas') mainCanvas: ElementRef;

  constructor(public rocketService: BitRocketService) {
    this.subscription = this.rocketService.gameStatusChanged.subscribe(status => this.gameStatusChange(status));
  }

  ngOnInit() {
    this.initialize();
    this.interval = setInterval(() => {
      this.updateScreen();
    }, 100);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.removeListener();
    this.clearTimers();
    this.clearObjects();
  }

  gameStatusChange(status: RocketGameStatus) {
    if (status === Started) {
      this.msgText = 'PLACE BET NOW';
      this.msgPlay = true;

      this.containers.smoke.alpha = 1.0;
      this.containers.smoke.visible = true;

      this.sprites.trail.visible = false;
      this.sprites.rocketSmokeSpread.visible = true;
      this.sprites.rocketSmokeSpread.gotoAndPlay('start');
      this.rocketService.playSound('launch', 1);

      this.sprites.siloRadar.gotoAndPlay('start');

      this.is1stOnFrame = true;
    } else if (status === Launched) {
      this.launchStarted = Date.now();
    } else if (status === Crashed) {
      this.launchStarted = null;
      this.rocketService.stopSound();

      this.msgText = `BUSTED AT ${this.rocketService.multiplier > 1.0 ? this.rocketService.multiplier.toFixed(2) : '1.00 '}X`;
      this.msgPlay = true;

      if (this.isReady) {
        this.isReady = false;
        this.is1stOnFrame = true;

        this.rocketService.playSound('crash-launch-alert', 1);

        this.timers[0] = setTimeout(() => {
          this.sprites.crashLaunch.gotoAndPlay('start');
          this.containers.rocketAnimation.addChild(this.sprites.crashLaunch);
          this.containers.rocketAnimation.visible = true;
          this.rocketService.playSound('crash-launch-heat', 1);
          this.containers.rocket.visible = false;
          this.timers[0] = null;
        }, 2000);

        this.timers[1] = setTimeout(() => {
          this.rocketService.playSound('crash-launch', 1);
          this.timers[1] = null;
        }, 3800);

        this.timers[2] = setTimeout(() => {
          this.sprites.rocketSmokeCloud.visible = false;
          this.sprites.rocketSmokeCloud.stop();
          this.timers[2] = null;
        }, 1000);

        this.tweens.rocketSmokeSpread = Tween
          .get(this.sprites.rocketSmokeSpread, { paused: false, override: true})
          .to({ alpha: 0 }, 1000)
          .call(() => {
            Tween.removeTweens(this.sprites.rocketSmokeSpread);
            this.sprites.rocketSmokeSpread.visible = false;
            this.sprites.rocketSmokeSpread.alpha = 1;
            this.sprites.rocketSmokeSpread.stop();
            this.tweens.rocketSmokeSpread = null;
          });

      } else {
        this.rocketService.playSound('crash', 1);
        this.is1stOnFrame = true;

        if (this.isMiniRocket) {
          this.sprites.crashMars.gotoAndPlay('start');

          const scale = this.sprites.rocketMiniRotate.scaleX;

          if (scale !== 1) {
            this.sprites.crashMars.scaleX = scale;
            this.sprites.crashMars.scaleY = scale;
            this.sprites.crashMars.x = (this.canvasMaxWidth - Sprites['rocketCrashMars'].frames.width * scale) / 2;
            this.sprites.crashMars.y = this.canvasHeight - Sprites['rocketCrashMars'].frames.height + 47 - 473 * (scale - 1);

            this.containers.rocketAnimation.removeChild(this.sprites.rocketMiniRotate);
          }

          this.containers.rocketAnimation.addChild(this.sprites.crashMars);
        } else if (this.rocketService.multiplier < Atmosphere) {
          this.sprites.crashEarth.gotoAndPlay('start');
          this.containers.rocketAnimation.addChild(this.sprites.crashEarth);
        } else {
          this.sprites.crashSpace.gotoAndPlay('start');
          this.containers.rocketAnimation.addChild(this.sprites.crashSpace);
        }

        this.containers.rocketAnimation.visible = true;
        this.sprites.trail.visible = false;
        this.containers.rocket.visible = false;
      }
    }
  }

  updateScreen() {
    const { gameStatus, multiplierEqu } = this.rocketService;

    if (gameStatus === Launched) {
      const elapsed = (Date.now() - this.launchStarted) / 1000;
      const { base, coefficient } = multiplierEqu;
      const multiplier = Math.pow(base, elapsed * coefficient * 1000);

      this.rocketService.setMultiplier(multiplier);

      if (multiplier >= SpaceAfterMars) {
        this.prevSpace = SpaceAfterMars;
        return;
      } else if (multiplier >= RocketRotating) {
        if (this.prevSpace !== RocketRotating) {
          this.prevSpace = RocketRotating;
          this.rocketRotate();
        }
        return;
      } else if (multiplier >= Mars) {
        if (this.prevSpace !== Mars) {
          this.prevSpace = Mars;
          this.rocketService.playSound('mars', 1);
        }
        return;
      } else if (multiplier >= MarsApproach) {
        if (this.prevSpace !== MarsApproach) {
          this.prevSpace = MarsApproach;
          this.rocketService.playSound('mars-approach', 1);
        }
        return;
      } else if (multiplier >= ToMarsElon) {
        if (this.prevSpace !== ToMarsElon) {
          this.prevSpace = ToMarsElon;
          this.toMarsElon();
        }
        return;
      } else if (multiplier >= ToMarsText) {
        if (this.prevSpace !== ToMarsText) {
          this.prevSpace = ToMarsText;
          this.toMarsText();
        }
        return;
      } else if (multiplier >= RocketSplit) {
        if (this.prevSpace !== RocketSplit) {
          this.prevSpace = RocketSplit;
          this.rocketSplit();
        }
        return;
      } else if (multiplier >= Moon) {
        if (this.prevSpace !== Moon) {
          this.prevSpace = Moon;
          this.rocketService.playSound('moon', 1);
        }
        return;
      } else if (multiplier >= MoonApproach) {
        if (this.prevSpace !== MoonApproach) {
          this.prevSpace = MoonApproach;
          this.rocketService.playSound('moon-approach', 1);
        }
        return;
      } else if (multiplier >= Atmosphere) {
        if (this.prevSpace !== Atmosphere) {
          this.prevSpace = Atmosphere;
          this.rocketService.playSound('atmosphere', 1);
        }
        return;
      } else {
        this.prevSpace = Earth;
        return;
      }
    }
  }

  resetGame() {
    const delayTime = Math.min(ResetDalay, this.rocketService.multiplier * 10);

    this.containers.rocket.y = Math.max(this.minBackHeight, this.canvasHeight);
    this.containers.rocket.visible = true;

    this.shapes.siloLines.scaleX = 1;

    if (this.isMiniRocket) {
      this.containers.rocket.removeChild(this.bitmaps.rocketMini);
      this.containers.rocket.removeChild(this.sprites.trailMini);
      this.containers.rocket.addChildAt(this.sprites.trail, 1);
      this.containers.rocket.addChildAt(this.bitmaps.rocketFull, 2);
      this.isMiniRocket = false;
    }

    this.tweens.launchBackground = Tween
      .get(this.containers.launchBackground, { paused: false, override: true })
      .wait(delayTime)
      .to({ y: 0 }, RocketLaunch / 5, Ease.getPowOut(1))
      .call(() => {
        Tween.removeTweens(this.containers.launchBackground);
        this.sprites.siloRadar.gotoAndStop('start');
        this.tweens.launchBackground = null;
      });

    this.tweens.silo = Tween
      .get(this.containers.silo, { paused: false, override: true })
      .wait(delayTime)
      .to({ y: 0 }, RocketLaunch / 5, Ease.getPowOut(1))
      .call(() => {
        Tween.removeTweens(this.containers.silo);
        this.tweens.silo = null;
      });

    this.tweens.rocket = Tween
      .get(this.containers.rocket, { paused: false, override: true })
      .wait(delayTime)
      .to({ y: 0 }, RocketLaunch / 5, Ease.getPowOut(1))
      .call(() => {
        Tween.removeTweens(this.containers.rocket);
        this.containers.smoke.y = 0;
        this.containers.maskForSpread.y = 0;
        this.isReady = true;
        this.tweens.rocket = null;
      });
    this.rocketService.initialize();
    this.containers.rocket.visible = true;
    this.containers.maskForSpread.visible = true;
    this.shapes.siloLines.visible = true;
    this.containers.silo.visible = true;
    this.containers.launchBackground.visible = true;
    this.containers.rocketAnimation.visible = false;

    this.sprites.rocketSmokeSpread.gotoAndStop('play');
  }

  launchRocket() {
    this.rocketService.setMultiplier(0);
    this.isReady = false;
    this.msgPlay = false;

    this.sprites.rocketSmokeCloud.gotoAndPlay(4);
    this.containers.smoke.addChild(this.sprites.rocketSmokeCloud);

    this.rocketService.setGameStatus(Launched);

    this.sprites.rocketSmokeCloud.visible = true;
    this.sprites.trail.visible = true;

    this.sprites.rocketSmokeSpread.visible = false;
    this.sprites.rocketSmokeSpread.stop();

    this.sprites.rocketMiniRotate.scaleX = 1;
    this.sprites.rocketMiniRotate.scaleY = 1;

    const crashTime = 0;

    const hA = 0.75;

    this.tweens.launchBackground = Tween
      .get(this.containers.launchBackground, { paused: false, override: true })
      .to({ y: Math.max(this.minBackHeight, this.canvasHeight * hA) }, RocketLaunch - crashTime, Ease.getPowInOut(3))
      .call(() => {
        Tween.removeTweens(this.containers.launchBackground);
        this.sprites.siloRadar.gotoAndStop('start');
        this.containers.launchBackground.visible = false;
        this.tweens.launchBackground = null;
      });

    this.tweens.silo = Tween
      .get(this.containers.silo, { paused: false, override: true })
      .to({ y: Math.max(this.minBackHeight, this.canvasHeight * hA) }, RocketLaunch - crashTime, Ease.getPowInOut(3))
      .call(() => {
        Tween.removeTweens(this.containers.silo);
        this.containers.silo.visible = false;
        this.tweens.silo = null;
      });

    this.tweens.smoke = Tween
      .get(this.containers.smoke, { paused: false, override: true })
      .to({ y: Math.max(this.minBackHeight, this.canvasHeight * hA) }, RocketLaunch - crashTime, Ease.getPowInOut(3))
      .call(() => {
        Tween.removeTweens(this.containers.smoke);
        this.containers.smoke.removeChild(this.sprites.rocketSmokeCloud);
        this.containers.smoke.visible = false;
        this.tweens.smoke = null;
      });

    this.tweens.maskForSpread = Tween
      .get(this.containers.maskForSpread, { paused: false, override: true })
      .to({ y: Math.max(this.minBackHeight, this.canvasHeight * hA) }, RocketLaunch - crashTime, Ease.getPowInOut(3))
      .call(() => {
        Tween.removeTweens(this.containers.maskForSpread);
        this.containers.maskForSpread.visible = false;
        this.tweens.maskForSpread = null;
      });

    this.tweens.siloLines = Tween
      .get(this.shapes.siloLines, { paused: false, override: true })
      .wait(100)
      .to({ scaleX: 0.6 }, RocketLaunch / 2)
      .call(() => {
        Tween.removeTweens(this.shapes.siloLines);
        this.shapes.siloLines.visible = false;
        this.tweens.siloLines = null;
      });
  }

  initialize(): void {
    this.minBackHeight = 1000;

    this.mainCanvas.nativeElement.setAttribute('width', this.canvasMaxWidth);
    this.mainCanvas.nativeElement.setAttribute('height', this.canvasHeight);
    this.stageMain = new Stage(this.mainCanvas.nativeElement);
    this.isMiniRocket = false;
    this.isReady = true;
    this.containers.launchBackground = new Container();

    this.shapes.gradient = new Shape();
    this.shapes.gradient.graphics
      .beginLinearGradientFill(['rgba(106,37,147,0)', '#511768'], [0, 1], 0, 0, 0, this.canvasHeight)
      .drawRect(-((Images[0].width * 1) / StageScale - this.canvasMaxWidth) / 2, 0, (Images[0].width * 1) / StageScale, this.canvasHeight);
    this.shapes.gradient.scaleX = 1 / StageScale;
    this.shapes.gradient.scaleY = 1 / StageScale;
    this.containers.launchBackground.addChild(this.shapes.gradient);

    this.containers.silo = new Container();

    this.bitmaps.mountain = new Bitmap(this.rocketService.queue.getResult('mountain'));
    this.bitmaps.mountain.scaleX = 1 / StageScale;
    this.bitmaps.mountain.scaleY = 1 / StageScale;

    this.bitmaps.mountain.x = (this.canvasMaxWidth - (Images[0].width * 1) / StageScale) / 2;
    this.bitmaps.mountain.y = this.canvasHeight - (Images[0].height * 1) / StageScale + 80;

    this.bitmaps.silo = new Bitmap(this.rocketService.queue.getResult('silo'));
    this.bitmaps.silo.x = (this.canvasMaxWidth - Images[1].width) / 2 + 40;
    this.bitmaps.silo.y = this.canvasHeight - Images[1].height - 60;

    this.shapes.ground = new Shape();
    this.shapes.ground.graphics
      .beginFill('#511768')
      .rect(-((Images[0].width * 1) / StageScale - this.canvasMaxWidth) / 2, 0, (Images[0].width * 1) / StageScale, 100);
    this.shapes.ground.y = this.canvasHeight - 60;

    this.shapes.siloLines = new Shape();
    this.shapes.siloLines.graphics.beginFill('#f0424a').rect(-100, 0, 100, 10);
    this.shapes.siloLines.graphics.beginFill('#f0424a').rect(-100, 100, 100, 10);
    this.shapes.siloLines.x = (this.canvasMaxWidth - 100) / 2 + 167;
    this.shapes.siloLines.y = this.canvasHeight - 370;

    const sheetSiloRadar = new SpriteSheet(Sprites['siloRadar']);

    this.sprites.siloRadar = new Sprite(sheetSiloRadar);

    this.sprites.siloRadar.x = (this.canvasMaxWidth - Sprites['siloRadar'].frames.width) / 2 + 385;
    this.sprites.siloRadar.y = this.canvasHeight - Sprites['siloRadar'].frames.height - 180;

    this.containers.silo.addChildAt(this.bitmaps.mountain, 0);
    this.containers.silo.addChildAt(this.bitmaps.silo, 1);
    this.containers.silo.addChildAt(this.shapes.ground, 2);
    this.containers.silo.addChildAt(this.shapes.siloLines, 3);
    this.containers.silo.addChildAt(this.sprites.siloRadar, 4);

    const scaleSmokeBack = 0.95;

    this.containers.rocket = new Container();

    this.bitmaps.rocketFull = new Bitmap(this.rocketService.queue.getResult('rocket-full'));
    this.bitmaps.rocketFull.x = (this.canvasMaxWidth - Images[2].width) / 2;
    this.bitmaps.rocketFull.y = this.canvasHeight - Images[2].height - 210;

    this.bitmaps.rocketMini = new Bitmap(this.rocketService.queue.getResult('rocket-mini'));
    this.bitmaps.rocketMini.x = (this.canvasMaxWidth - Images[4].width) / 2;
    this.bitmaps.rocketMini.y = this.canvasHeight - Images[4].height - 429;

    let sheet = Sprites['rocketSmokeSpread'];
    sheet.images[0] = this.rocketService.queue.getResult('rocket-smoke-spread');

    const sheetRocketSmokeBack = new SpriteSheet(sheet);

    this.sprites.rocketSmokeSpread = new Sprite(sheetRocketSmokeBack);
    this.sprites.rocketSmokeSpread.x = (this.canvasMaxWidth - Sprites['rocketSmokeSpread'].frames.width) / 2 - 1;
    this.sprites.rocketSmokeSpread.y = this.canvasHeight - Sprites['rocketSmokeSpread'].frames.height - 140;
    this.isPlaying = false;
    this.sprites.rocketSmokeSpread.visible = false;

    // Trails

    const sheetTrail = new SpriteSheet(Sprites['trail']);

    this.sprites.trail = new Sprite(sheetTrail);
    this.sprites.trail.scaleX = scaleSmokeBack;
    this.sprites.trail.scaleY = scaleSmokeBack;
    this.sprites.trail.x = (this.canvasMaxWidth - Sprites['trail'].frames.width * scaleSmokeBack) / 2 - 1;
    this.sprites.trail.y = this.canvasHeight - Sprites['trail'].frames.height * scaleSmokeBack + 65;

    const sheetTrailMini = new SpriteSheet(Sprites['trailMiniRocket']);

    this.sprites.trailMini = new Sprite(sheetTrailMini);
    this.sprites.trailMini.x = (this.canvasMaxWidth - Sprites['trailMiniRocket'].frames.width) / 2;
    this.sprites.trailMini.y = this.canvasHeight - Sprites['trailMiniRocket'].frames.height - 290;

    this.containers.rocket.addChildAt(this.sprites.rocketSmokeSpread, 0);
    this.containers.rocket.addChildAt(this.sprites.trail, 1);
    this.containers.rocket.addChildAt(this.bitmaps.rocketFull, 2);

    this.containers.rocketAnimation = new Container();

    const sheetRocketMiniRotate = new SpriteSheet(Sprites['rocketMiniRotate']);

    this.sprites.rocketMiniRotate = new Sprite(sheetRocketMiniRotate);
    this.sprites.rocketMiniRotate.x = (this.canvasMaxWidth - Sprites['rocketMiniRotate'].frames.width) / 2 - 1;
    this.sprites.rocketMiniRotate.y = this.canvasHeight - Sprites['rocketMiniRotate'].frames.height - 236;

    sheet = Sprites['rocketSplit'];
    const sheetRocketSplit = new SpriteSheet(sheet);
    this.sprites.rocketSplit = new Sprite(sheetRocketSplit);
    this.sprites.rocketSplit.x = (this.canvasMaxWidth - Sprites['rocketSplit'].frames.width) / 2 - 2;
    this.sprites.rocketSplit.y = this.canvasHeight - Sprites['rocketSplit'].frames.height + 85;

    // Crashes
    const sheetRocketCrashLaunch = new SpriteSheet(Sprites['rocketCrashLaunch']);

    this.sprites.crashLaunch = new Sprite(sheetRocketCrashLaunch);
    this.sprites.crashLaunch.x = (this.canvasMaxWidth - Sprites['rocketCrashLaunch'].frames.width) / 2;
    this.sprites.crashLaunch.y = this.canvasHeight - Sprites['rocketCrashLaunch'].frames.height - 137;

    const sheetRocketCrashEarth = new SpriteSheet(Sprites['rocketCrashEarth']);

    this.sprites.crashEarth = new Sprite(sheetRocketCrashEarth, 'start');
    this.sprites.crashEarth.x = (this.canvasMaxWidth - Sprites['rocketCrashEarth'].frames.width) / 2;
    this.sprites.crashEarth.y = this.canvasHeight - Sprites['rocketCrashEarth'].frames.height + 87;

    const sheetRocketCrashSpace = new SpriteSheet(Sprites['rocketCrashSpace']);

    this.sprites.crashSpace = new Sprite(sheetRocketCrashSpace);
    this.sprites.crashSpace.x = (this.canvasMaxWidth - Sprites['rocketCrashSpace'].frames.width) / 2;
    this.sprites.crashSpace.y = this.canvasHeight - Sprites['rocketCrashSpace'].frames.height + 87;

    const sheetRocketCrashMars = new SpriteSheet(Sprites['rocketCrashMars']);

    this.sprites.crashMars = new Sprite(sheetRocketCrashMars);
    this.sprites.crashMars.x = (this.canvasMaxWidth - Sprites['rocketCrashMars'].frames.width) / 2;
    this.sprites.crashMars.y = this.canvasHeight - Sprites['rocketCrashMars'].frames.height + 87;

    // Launch Smoke

    this.containers.smoke = new Container();

    sheet = Sprites['rocketSmokeCloud'];
    sheet.images[0] = this.rocketService.queue.getResult('rocket-smoke-cloud');

    const sheetRocketSmokeCloud = new SpriteSheet(sheet);

    this.sprites.rocketSmokeCloud = new Sprite(sheetRocketSmokeCloud, 'start');
    this.sprites.rocketSmokeCloud.x = (this.canvasMaxWidth - Sprites['rocketSmokeCloud'].frames.width) / 2;
    this.sprites.rocketSmokeCloud.y = this.canvasHeight - Sprites['rocketSmokeCloud'].frames.height - 130;

    this.containers.maskForSpread = new Container();

    this.shapes.maskForSpread = new Shape();
    this.shapes.maskForSpread.graphics.beginFill('#6a2594').rect(0, 0, 1, 1);
    this.shapes.maskForSpread.cache(0, 0, 1, 1);
    this.shapes.maskForSpread.scaleX = 517;
    this.shapes.maskForSpread.scaleY = 20;
    this.shapes.maskForSpread.x = (this.canvasMaxWidth - 510) / 2 - 1;
    this.shapes.maskForSpread.y = this.canvasHeight - 140;

    this.containers.maskForSpread.addChild(this.shapes.maskForSpread);

    // To Mars

    this.containers.toMars = new Container();

    const sheetToMarsElon = new SpriteSheet(Sprites['toMarsElon']);
    this.sprites.toMarsElon = new Sprite(sheetToMarsElon);
    this.sprites.toMarsElon.scaleX = 2.0;
    this.sprites.toMarsElon.scaleY = 2.0;

    this.sprites.toMarsElon.x = (this.canvasMaxWidth - Sprites['toMarsElon'].frames.width * 2.0) / 2;

    const sheetToMarsText = new SpriteSheet(Sprites['toMarsText']);
    this.sprites.toMarsText = new Sprite(sheetToMarsText);
    this.sprites.toMarsText.x = (this.canvasMaxWidth - Sprites['toMarsText'].frames.width) / 2;
    this.sprites.toMarsText.y = this.canvasHeight - Sprites['toMarsText'].frames.height - 10;

    this.containers.wrapper = new Container();

    this.containers.wrapper.addChildAt(this.containers.launchBackground, 0);
    this.containers.wrapper.addChildAt(this.containers.silo, 1);
    this.containers.wrapper.addChildAt(this.containers.rocket, 2);
    this.containers.wrapper.addChildAt(this.containers.rocketAnimation, 3);
    this.containers.wrapper.addChildAt(this.containers.smoke, 4);
    this.containers.wrapper.addChildAt(this.containers.maskForSpread, 5);
    this.containers.wrapper.addChildAt(this.containers.toMars, 6);

    this.containers.wrapper.scaleX = StageScale;
    this.containers.wrapper.scaleY = StageScale;
    this.containers.wrapper.x = (this.canvasMaxWidth * (1 - StageScale)) / 2;
    this.containers.wrapper.y = this.canvasHeight * (1 - StageScale);
    this.stageMain.addChild(this.containers.wrapper);

    this.sprites.crashMars.gotoAndStop(15);

    Ticker.setFPS(30);

    this.addListener();
  }

  toMarsText() {
    this.rocketService.playSound('musk-voice', 1);
    this.containers.toMars.addChild(this.sprites.toMarsText);
    this.sprites.toMarsText.gotoAndPlay('start');
  }

  toMarsElon() {
    this.containers.toMars.addChild(this.sprites.toMarsElon);
    this.sprites.toMarsElon.gotoAndPlay('start');
    this.sprites.toMarsElon.y = this.canvasHeight;

    this.tweens.marsToMars = Tween
      .get(this.sprites.toMarsElon, { paused: false, override: true })
      .to({ y: (this.canvasHeight - Sprites['toMarsElon'].frames.height * 2.0) / 2 + 60 }, 800, Ease.getPowOut(2))
      .wait(400)
      .to({ y: -Sprites['toMarsElon'].frames.height * 2.0 }, 700, Ease.getPowIn(2))
      .call(() => {
        this.containers.toMars.removeChild(this.sprites.toMarsElon);
        Tween.removeTweens(this.sprites.toMarsElon);
        this.tweens.marsToMars = null;
      });
  }

  rocketSplit() {
    this.is1stOnFrame = true;

    this.rocketService.playSound('split', 1);
    this.sprites.rocketSplit.visible = true;
    this.containers.rocketAnimation.addChild(this.sprites.rocketSplit);
    this.sprites.rocketSplit.gotoAndPlay('start');

    this.isMiniRocket = true;
  }

  rocketRotate() {
    this.is1stOnFrame = true;
    this.containers.rocket.visible = false;
    this.rocketService.playSound('rotate', 1);
    this.sprites.rocketMiniRotate.gotoAndPlay('start');
    this.containers.rocketAnimation.addChild(
      this.sprites.rocketMiniRotate,
    );
    this.containers.rocketAnimation.visible = true;
  }

  start(): void {
    this.rocketService.setGameStatus(Started);
  }

  crash(): void {
    this.rocketService.setGameStatus(Crashed);
  }

  addListener() {
    this.tickers.rocketSmokeSpread = this.sprites.rocketSmokeSpread.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame === this.prevFrameOfSpread) {
        return;
      }

      this.prevFrameOfSpread = currentFrame;

      if (currentFrame >= 123 && this.isReady && !this.isPlaying) {
        this.isPlaying = true;
        this.sprites.trail.gotoAndPlay('start');
      } else if (currentFrame > 130 && this.is1stOnFrame && this.isReady) {
        this.is1stOnFrame = false;
        this.launchRocket();
        this.isPlaying = false;
      }
    });

    this.tickers.rocketMiniRotate = this.sprites.rocketMiniRotate.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      const scaleMiniRocket = (currentFrame - Sprites['rocketMiniRotate'].frames.count / 2) / (Sprites['rocketMiniRotate'].frames.count / 2);
      this.sprites.rocketMiniRotate.scaleX = (1 - scaleMiniRocket * scaleMiniRocket) / 3 + 1;
      this.sprites.rocketMiniRotate.scaleY = (1 - scaleMiniRocket * scaleMiniRocket) / 3 + 1;
      this.sprites.rocketMiniRotate.x = (this.canvasMaxWidth - Sprites['rocketMiniRotate'].frames.width * this.sprites.rocketMiniRotate.scaleX) / 2 - 1;

      if (currentFrame >= Sprites['rocketMiniRotate'].frames.count - 1) {
        this.containers.rocket.visible = true;
        this.containers.rocketAnimation.visible = false;
        this.containers.rocketAnimation.removeChild(this.sprites.rocketMiniRotate);
        this.sprites.rocketMiniRotate.stop();
        this.sprites.rocketMiniRotate.scaleX = 1;
        this.sprites.rocketMiniRotate.scaleY = 1;
        this.sprites.rocketMiniRotate.x = (this.canvasMaxWidth - Sprites['rocketMiniRotate'].frames.width) / 2 - 1;
      }
    });

    this.tickers.rocketSplit = this.sprites.rocketSplit.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame >= Sprites['rocketSplit'].frames.count - 1) {
        this.sprites.rocketSplit.stop();
        this.containers.rocketAnimation.removeChild(this.sprites.rocketSplit);

        if (this.rocketService.gameStatus === Launched) {
          this.containers.rocketAnimation.visible = false;
        }
      } else if (this.is1stOnFrame) {
        this.is1stOnFrame = false;
        this.containers.rocketAnimation.visible = true;
        this.containers.rocket.removeChild(this.sprites.trail);
        this.containers.rocket.removeChild(this.bitmaps.rocketFull);
        this.sprites.rocketSplit.visible = true;
        this.sprites.trailMini.gotoAndPlay('start');
        this.containers.rocket.addChildAt(this.sprites.trailMini, 1);
        this.containers.rocket.addChildAt(this.bitmaps.rocketMini, 2);
      }
    });

    this.tickers.crashLaunch = this.sprites.crashLaunch.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame >= Sprites['rocketCrashLaunch'].frames.count - 1 && this.is1stOnFrame) {
        this.is1stOnFrame = false;
        this.sprites.crashLaunch.stop();
        this.sprites.siloRadar.gotoAndStop('start');

        this.timers[3] = setTimeout(() => {
          this.containers.rocket.visible = true;

          this.containers.rocketAnimation.removeChild(this.sprites.crashLaunch);
          this.rocketService.setGameStatus(Init);

          this.isReady = true;
          this.sprites.rocketSmokeSpread.gotoAndStop('start');
          this.timers[3] = null;
        }, 3000);
      }
    });

    this.tickers.crashEarth = this.sprites.crashEarth.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame >= Sprites['rocketCrashEarth'].frames.count - 1) {
        this.sprites.crashEarth.stop();
        this.containers.rocketAnimation.removeChild(this.sprites.crashEarth);
        this.rocketService.setGameStatus(AfterCrash);
        this.resetGame();
        this.timers[4] = setTimeout(() => {
          this.rocketService.setGameStatus(Started);
          this.timers[4] = null;
        }, 3000);
      }
    });

    this.tickers.crashSpace = this.sprites.crashSpace.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame >= Sprites['rocketCrashSpace'].frames.count - 1) {
        this.sprites.crashSpace.stop();
        this.containers.rocketAnimation.removeChild(this.sprites.crashSpace);
        this.rocketService.setGameStatus(AfterCrash);
        this.resetGame();
        this.timers[5] = setTimeout(() => {
          this.rocketService.setGameStatus(Started);
          this.timers[5] = null;
        }, 3000);
      }
    });

    this.tickers.crashMars = this.sprites.crashMars.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame >= Sprites['rocketCrashMars'].frames.count - 1) {
        this.sprites.crashMars.stop();
        this.containers.rocketAnimation.removeChild(this.sprites.crashMars);
        this.sprites.crashMars.x = (this.canvasMaxWidth - Sprites['rocketCrashMars'].frames.width) / 2;
        this.sprites.crashMars.y = this.canvasHeight - Sprites['rocketCrashMars'].frames.height + 87;
        this.sprites.crashMars.scaleX = 1;
        this.sprites.crashMars.scaleY = 1;
        this.rocketService.setGameStatus(AfterCrash);
        this.resetGame();
        this.timers[6] = setTimeout(() => {
          this.rocketService.setGameStatus(Started);
          this.timers[6] = null;
        }, 3000);
      }
    });

    this.tickers.rocketSmokeCloud = this.sprites.rocketSmokeCloud.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (currentFrame >= Sprites['rocketSmokeCloud'].frames.count - 1) {
        this.sprites.rocketSmokeCloud.stop();
        this.sprites.rocketSmokeCloud.visible = false;
      }
    });

    this.tickers.toMarsText = this.sprites.toMarsText.on('tick', event => {
      const { currentFrame } = event.currentTarget;

      if (this.rocketService.gameStatus === Crashed) {
        this.sprites.toMarsText.stop();
        this.sprites.toMarsText.visible = false;
        this.containers.toMars.removeChild(this.sprites.toMarsText);
      } else if (currentFrame >= Sprites['toMarsText'].frames.count - 1) {
        this.sprites.toMarsText.stop();
        this.sprites.toMarsText.visible = false;
        this.containers.toMars.removeChild(this.sprites.toMarsText);
      }
    });

    this.stageTicker = Ticker.addEventListener('tick', this.stageMain);
  }

  removeListener(): void {
    if (this.stageTicker) {
      Ticker.removeEventListener('tick', this.stageMain);
      this.stageTicker = null;
    }

    forEach(keys(this.tickers), key => {
      if (this.tickers[key]) {
        this.sprites[key].off('tick', this.tickers[key]);
        this.tickers[key] = null;
      }
    });
  }

  clearObjects(): void {
    this.stageMain = null;

    for (let key in this.containers) {
      if (this.containers[key]) {
        this.containers[key] = null;
      }
    }

    for (let key in this.sprites) {
      if (this.sprites[key]) {
        this.sprites[key] = null;
      }
    }

    for (let key in this.shapes) {
      if (this.shapes[key]) {
        this.shapes[key] = null;
      }
    }

    for (let key in this.bitmaps) {
      if (this.bitmaps[key]) {
        this.bitmaps[key] = null;
      }
    }

    this.isMiniRocket = null;
    this.isReady = null;
    this.is1stOnFrame = null;
    this.prevSpace = null;
    this.isPlaying = null;
    this.msgText = null;
    this.msgPlay = null;
    this.prevFrameOfSpread = null;
    this.minBackHeight = null;
  }

  clearTimers(): void {
    forEach(keys(this.tweens), key => {
      if (this.sprites[key]) {
        Tween.removeTweens(this.sprites[key]);
      } else if (this.containers[key]) {
        Tween.removeTweens(this.containers[key]);
      } else if (this.shapes[key]) {
        Tween.removeTweens(this.shapes[key]);
      }
      this.tweens[key] = null;
    });

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    forEach(this.timers, timeout => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    });
  }
}
