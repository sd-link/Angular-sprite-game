import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { autoPlay, Easing, Tween } from 'es6-tween';
import { forEach, keys } from 'lodash';

@Component({
  selector: 'app-rocket-message',
  templateUrl: './rocket-message.component.html',
  styleUrls: ['./rocket-message.component.scss'],
})
export class RocketMessageComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {
  lineLength: number;
  playState: boolean;
  cycleOffset: number;

  timers = [];

  borderTweenIn: any;
  borderTweenOut: any;
  textFadeOut: any;
  textFadeIn: any;

  @Input() text: string;
  @Input() color: string;
  @Input() size = 20;
  @Input() play: boolean;
  @Input() duration: number;

  @Output() animationCompleted: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('wrapper') wrapper: ElementRef;
  @ViewChild('svgWrapper') svgWrapper: ElementRef;
  @ViewChild('svgLineAnimation') svgLineAnimation: ElementRef;
  @ViewChild('borderAnimation') borderAnimation: ElementRef;
  @ViewChild('title') title: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.clearTimers();
    this.removeListeners();
  }

  ngOnChanges() {
    if (this.play && !this.playState) {
      this.initAnimation();
      this.timers[0] = setTimeout(() => {
        this.playAnimation();
        this.timers[0] = null;
      }, 100);
    }
  }

  ngAfterContentInit() {
    this.initAnimation();
  }

  initAnimation() {
    const round = 15;
    const borderWidth = 3;
    const paddingX = 30;
    const paddingY = 15;

    this.title.nativeElement.setAttribute(
      'style',
      `opacity: 0; font-size: ${this.size}px; color: ${this.color}; line-height: ${this.size < 15 ? 15 : this.size}px;`,
    );

    this.timers[1] = setTimeout(() => {
      const width = this.title.nativeElement.clientWidth + paddingX * 2;
      const height = this.title.nativeElement.clientHeight + paddingY * 2;

      this.wrapper.nativeElement.setAttribute('style', `width: 100%; height: ${height + borderWidth}px`);

      this.svgWrapper.nativeElement.setAttribute('style', `margin-bottom: ${paddingY - height - borderWidth}px; height: ${height + borderWidth}px`);

      this.svgLineAnimation.nativeElement.setAttribute('width', width + borderWidth);
      this.svgLineAnimation.nativeElement.setAttribute('height', height + borderWidth);

      const attributes = {
        stroke: this.color,
        x: borderWidth / 2.0,
        y: borderWidth / 2.0,
        width,
        height,
        rx: round,
        ry: round,
        'stroke-width': borderWidth,
        'stroke-opacity': 0,
      };

      forEach(keys(attributes), key => {
        this.borderAnimation.nativeElement.setAttribute(key, attributes[key]);
      });

      this.lineLength = (width + height) * 2;
      this.cycleOffset = width;
      this.timers[1] = null;
    }, 0);
  }

  playAnimation() {
    const fadeDuratin = 8.0;

    let checkOutEndPoint = false;
    this.playState = true;

    autoPlay(true);

    this.borderTweenIn = new Tween({ dashOffset: 0 })
      .to({ dashOffset: this.lineLength }, (this.duration * 1000) / 2)
      .easing(Easing.Quadratic.In)
      .on('update', ({ dashOffset }) => {
        this.borderAnimation.nativeElement.setAttribute('stroke-dashoffset', -dashOffset - this.cycleOffset);
        this.borderAnimation.nativeElement.setAttribute('stroke-dasharray', `${dashOffset / 2} ${this.lineLength - dashOffset / 2}`);
        this.borderAnimation.nativeElement.setAttribute('stroke-opacity', (dashOffset * fadeDuratin) / this.lineLength);
      })
      .on('complete', () => {
        if (this.borderTweenOut) {
          this.borderTweenOut.start();
        }
      });

    this.borderTweenOut = new Tween({ dashOffset: this.lineLength })
      .to({ dashOffset: this.lineLength * 2 }, (this.duration * 1000) / 2)
      .easing(Easing.Quadratic.Out)
      .on('update', ({ dashOffset }) => {
        const textOpacity = ((this.lineLength * 2 - dashOffset) * fadeDuratin) / this.lineLength;
        this.borderAnimation.nativeElement.setAttribute('stroke-dashoffset', -dashOffset - this.cycleOffset);
        this.borderAnimation.nativeElement.setAttribute('stroke-dasharray', `${this.lineLength - dashOffset / 2} ${dashOffset / 2}`);
        this.borderAnimation.nativeElement.setAttribute('stroke-opacity', textOpacity);
        if (textOpacity < 1.0 && !checkOutEndPoint) {
          checkOutEndPoint = true;
          if (this.textFadeOut) {
            this.textFadeOut.start();
          }
        }
      });

    this.textFadeIn = new Tween({ opacity: 0 })
      .to({ opacity: 1 }, (this.duration * 1000) / (2 * fadeDuratin))
      .on('update', ({ opacity }) => {
        this.title.nativeElement.setAttribute(
          'style',
          `opacity: ${opacity}; font-size: ${this.size}px; color: ${this.color}; line-height: ${this.size < 15 ? 15 : this.size}px;`,
        );
      });

    this.textFadeOut = new Tween({ opacity: 1 })
      .to({ opacity: 0 }, (this.duration * 1000) / (2 * fadeDuratin))
      .on('update', ({ opacity }) => {
        this.title.nativeElement.setAttribute(
          'style',
          `opacity: ${opacity}; font-size: ${this.size}px; color: ${this.color}; line-height: ${this.size < 15 ? 15 : this.size}px;`,
        );
      })
      .on('complete', () => {
        this.playState = false;
        this.animationCompleted.emit('lineAnimation');
      });

    if (this.textFadeIn) {
      this.textFadeIn.start();
      this.borderTweenIn.start();
    }
  }

  clearTimers() {
    forEach(this.timers, timer => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    });
  }

  removeListeners() {
    this.borderTweenIn = null;
    this.borderTweenOut = null;
    this.textFadeIn = null;
    this.textFadeOut = null;
  }
}
