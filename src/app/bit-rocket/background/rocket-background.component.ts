import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Bitmap, Container, StageGL, Shape, Ticker } from 'easel-gl';
import { autoPlay, Tween } from 'es6-tween';
import { BitRocketService } from '../../../services/bit-rocket/bit-rocket.service';
import { Images, RocketColors, RocketSpaces, RocketStarConfig, RocketGameStatus, RocketTiming } from '../config';
import { getAverageColor } from '../../../helpers/string.helper';

const { Count, MaxRadius, MaxSpeed, MinRadiusScale, NormalSpeed } = RocketStarConfig;
const { Crashed, Launched, AfterCrash, Init } = RocketGameStatus;
const { Earth, Atmosphere, SpaceAtmoMoon, Moon, MoonSpeed, SpaceMoonMars, ToMarsText, Mars, MarsSpeed, SpaceAfterMars } = RocketSpaces;
const { ResetDalay, RocketLaunch } = RocketTiming;
const { Atmosphere: ColorAtmo, Earth: ColorEarth, Mars: ColorMars, Space: ColorSpace, Moon: ColorMoon } = RocketColors;

@Component({
  selector: 'app-rocket-background',
  templateUrl: './rocket-background.component.html',
  styleUrls: ['./rocket-background.component.scss'],
})
export class RocketBackgroundComponent implements OnInit, OnChanges, OnDestroy {
  stage: any;

  containers = {
    star: null,
    moon: null,
    mars: null,
  };

  bitmaps = {
    moon: null,
    mars: null,
  };

  shapeStars: any[];

  starFallSpeed: number;
  starSpeedIncreased = false;
  backColor: string;
  minBackHeight: number;
  canvasMaxWidth: number = Images[0].width;

  subscription = null;
  tickerListener = null;
  tickOnHandler = null;

  @Input() canvasWidth = 1000;
  @Input() canvasHeight = 800;

  @ViewChild('backCanvas') backCanvas: ElementRef;

  constructor(public rocketService: BitRocketService) {
    this.subscription = this.rocketService.gameStatusChanged.subscribe(status => this.gameStatusChange(status));
  }

  ngOnInit() {
    console.log('Init');
    this.initialize();
  }

  ngOnChanges() {
    console.log('Changes');
    this.adjustPosition();
  }

  ngOnDestroy() {
    console.log('Destroy');
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.stage = null;
    this.containers = {
      star: null,
      moon: null,
      mars: null,
    };
    this.bitmaps = {
      moon: null,
      mars: null,
    };
    this.shapeStars = null;
    this.removeListeners();
  }

  gameStatusChange(status: string): void {
    if (status === Init) {
      this.initialize();
    } else if (status === Crashed) {
      this.starFallSpeed = 0;
    } else if (status === Launched) {
      this.launchRocket();
    } else if (status === AfterCrash) {
      this.fallbackToSilo();
    }
  }

  adjustPosition(): void {
    console.log('Adjust Position');
    if (this.stage) {
      const { multiplier } = this.rocketService;

      this.bitmaps.mars.scaleX = 2 * (this.canvasWidth / 1000);
      this.bitmaps.mars.scaleY = 2 * (this.canvasWidth / 1000);
      this.bitmaps.mars.x = -(this.bitmaps.mars.scaleX * Images[9].width - this.canvasMaxWidth) / 2;
      if (!(multiplier >= Mars && multiplier < SpaceAfterMars)) {
        this.bitmaps.mars.y = -this.bitmaps.mars.scaleY * Images[9].height;
      }
    }
  }

  fallbackToSilo(): void {
    console.log('Fallback to Silo');
    const delayTime = Math.min(ResetDalay, this.rocketService.multiplier * 10);

    autoPlay(true);

    this.starFallSpeed = -MaxSpeed;

    let tweenForSpeed = new Tween({ speed: -MaxSpeed })
      .delay(delayTime)
      .to({ speed: 0 }, RocketLaunch / 5)
      .on('update', ({ speed }) => {
        if (this.stage) {
          this.starFallSpeed = speed;
        } else {
          this.starFallSpeed = 0;
          tweenForSpeed = null;
        }
      })
      .on('complete', () => {
        this.starFallSpeed = 0;
        tweenForSpeed = null;
      });

    tweenForSpeed.start();

    const curBackColor = this.backColor;

    let backColorChange = new Tween({ ft: 0.0 })
      .to({ ft: 1.0 }, delayTime + RocketLaunch / 5)
      .on('update', ({ ft }) => {
        if (this.stage) {
          this.backColor = getAverageColor(curBackColor, ColorEarth, ft);
          this.stage.setClearColor(this.backColor);
        } else {
          backColorChange = null;
          this.backColor = ColorEarth;
        }
      })
      .on('complete', () => {
        backColorChange = null;
        this.backColor = ColorEarth;
      });

    backColorChange.start();
  }

  launchRocket(): void {
    console.log('Launch Rocket');
    const delayTime = RocketLaunch;

    this.containers.moon.y = 0;
    this.containers.mars.y = 0;
    this.starSpeedIncreased = false;

    autoPlay(true);

    let tweenForSpeed = new Tween({ speed: 0.0 })
      .to({ speed: NormalSpeed }, delayTime)
      .on('update', ({ speed }) => {
        if (this.rocketService.gameStatus === Init) {
          tweenForSpeed = null;
          this.starFallSpeed = 0;
          return;
        }

        this.starFallSpeed = speed;
      })
      .on('complete', () => {
        tweenForSpeed = null;
      });

    tweenForSpeed.start();
  }

  initialize(): void {
    console.log('-------------------');
    console.log('Initialize');

    this.containers = {
      star: null,
      moon: null,
      mars: null,
    };
    this.bitmaps = {
      moon: null,
      mars: null,
    };
    this.shapeStars = null;
    this.starFallSpeed = 0;
    this.starSpeedIncreased = false;

    this.rocketService.setMultiplier(0);

    this.minBackHeight = 1000;

    this.backCanvas.nativeElement.setAttribute('width', this.canvasMaxWidth);
    this.backCanvas.nativeElement.setAttribute('height', this.canvasHeight);

    this.stage = new StageGL(this.backCanvas.nativeElement);
    this.stage.setClearColor(ColorEarth);

    /* star */
    this.containers.star = new Container();
    this.stage.addChild(this.containers.star);

    this.shapeStars = [];
    this.shapeStars.push(new Shape());
    this.shapeStars[0].graphics
      .beginFill('#ffffff')
      .drawCircle(0, 0, MaxRadius)
      .endFill();

    /* moon */
    this.containers.moon = new Container();
    this.stage.addChild(this.containers.moon);

    this.bitmaps.moon = new Bitmap(this.rocketService.queue.getResult('moon'));
    this.containers.moon.addChild(this.bitmaps.moon);
    this.bitmaps.moon.x = (this.canvasMaxWidth - Images[8].width) / 2 + Images[8].width / 2 + 100;
    this.bitmaps.moon.y = -Images[8].height;
    this.bitmaps.moon.cache(0, 0, Images[8].width, Images[8].height);

    /* mars */
    this.containers.mars = new Container();
    this.stage.addChild(this.containers.mars);

    this.bitmaps.mars = new Bitmap(this.rocketService.queue.getResult('mars'));
    this.containers.mars.addChild(this.bitmaps.mars);

    this.bitmaps.mars.cache(0, 0, Images[9].width, Images[9].height);
    this.bitmaps.mars.scaleX = 2 * (this.canvasMaxWidth / 1000);
    this.bitmaps.mars.scaleY = 2 * (this.canvasMaxWidth / 1000);

    this.bitmaps.mars.x = -(this.bitmaps.mars.scaleX * Images[9].width - this.canvasMaxWidth) / 2;
    this.bitmaps.mars.y = -this.bitmaps.mars.scaleY * Images[9].height;

    for (let i = 1; i < Count; i++) {
      this.shapeStars.push(this.shapeStars[0].clone());
      this.containers.star.addChild(this.shapeStars[i]);
      this.shapeStars[i].x = Math.random() * this.canvasMaxWidth;
      this.shapeStars[i].y = Math.random() * this.canvasHeight;

      const rnd = Math.random();
      const scaleR = Math.max(rnd, MinRadiusScale);

      this.shapeStars[i].scaleX = scaleR;
      this.shapeStars[i].scaleY = scaleR;
      this.shapeStars[i].cache(-MaxRadius, -MaxRadius, MaxRadius * 2, MaxRadius * 2);
      this.shapeStars[i].alpha = rnd;
    }

    this.addListeners();
  }

  addListeners(): void {
    console.log('Add Listeners');
    this.tickOnHandler = Ticker.on('tick', () => {
      const { gameStatus, multiplier } = this.rocketService;

      if (this.starFallSpeed) {
        for (let i = 0; i < Count; i++) {
          if (this.shapeStars[i].y < 0) {
            this.shapeStars[i].y = this.canvasHeight;
            this.shapeStars[i].x = Math.random() * this.canvasMaxWidth;

            const rnd = Math.random();
            const scaleR = Math.max(rnd, MinRadiusScale);

            this.shapeStars[i].scaleX = scaleR;
            this.shapeStars[i].scaleY = scaleR;
            this.shapeStars[i].alpha = rnd;
          } else if (this.shapeStars[i].y > this.canvasHeight) {
            this.shapeStars[i].y = 0;
            this.shapeStars[i].x = Math.random() * this.canvasMaxWidth;

            const rnd = Math.random();
            const scaleR = Math.max(rnd, MinRadiusScale);

            this.shapeStars[i].scaleX = scaleR;
            this.shapeStars[i].scaleY = scaleR;
            this.shapeStars[i].alpha = rnd;
          } else {
            const speed = this.starFallSpeed * this.shapeStars[i].scaleY;

            this.shapeStars[i].y += speed;
          }

          if (multiplier >= Moon && multiplier < ToMarsText) {
            this.containers.moon.y +=  this.starFallSpeed * MoonSpeed / 30;
            this.containers.moon.x = this.canvasWidth - ((this.containers.moon.y - this.canvasHeight) * (this.containers.moon.y - this.canvasHeight)) / (this.canvasHeight * 3) - 1350;
          } else if (multiplier >= Mars && multiplier < SpaceAfterMars) {
            this.containers.mars.y += this.starFallSpeed * MarsSpeed / 30;
          }
        }
      }

      if (gameStatus === Launched) {
        if (multiplier >= Earth && multiplier < Atmosphere) {
          const ft = (multiplier - 1) / (Atmosphere - Earth - 1) ;
          this.backColor = getAverageColor(ColorEarth, ColorAtmo, ft);
        } else if (multiplier >= Atmosphere && multiplier < SpaceAtmoMoon) {
          if (!this.starSpeedIncreased) {
            this.starFallSpeed = NormalSpeed * 2;
            this.starSpeedIncreased = true;
          }

          const ft = (multiplier - Atmosphere) / (SpaceAtmoMoon - Atmosphere);
          this.backColor = getAverageColor(ColorAtmo, ColorSpace, ft);
        } else if (multiplier >= SpaceAtmoMoon && multiplier < Moon) {
          const ft = (multiplier - SpaceAtmoMoon) / (Moon - SpaceAtmoMoon);
          this.backColor = getAverageColor(ColorSpace, ColorMoon, ft);
        } else if (multiplier >= Moon && multiplier < SpaceMoonMars) {
          const ft = (multiplier - Moon) / (SpaceMoonMars - Moon);
          this.backColor = getAverageColor(ColorMoon, ColorSpace, ft);
        } else if (multiplier >= SpaceMoonMars && multiplier < Mars) {
          const ft = (multiplier - SpaceMoonMars) / (Mars - SpaceMoonMars);
          this.backColor = getAverageColor(ColorSpace, ColorMars, ft);
        } else if (multiplier >= Mars && multiplier < SpaceAfterMars) {
          const ft = (multiplier - Mars) / (SpaceAfterMars - Mars);
          this.backColor = getAverageColor(ColorMars, ColorSpace, ft);
        } else if (multiplier >= SpaceAfterMars) {
          this.backColor = ColorSpace;
        }

        this.stage.setClearColor(multiplier < 1 ? ColorEarth : this.backColor);
      } else {
        this.backColor = ColorEarth;
      }
    });

    Ticker.setFPS(30);
    this.tickerListener = Ticker.addEventListener('tick', this.stage);
  }

  removeListeners(): void {
    console.log('Remove Listeners');

    if (this.tickerListener) {
      Ticker.removeEventListener('tick', this.stage);
      this.tickerListener = null;
    }

    if (this.tickOnHandler) {
      Ticker.off('tick', this.tickOnHandler);
      this.tickOnHandler = null;
    }
  }
}
