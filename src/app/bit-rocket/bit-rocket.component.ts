import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import 'latest-createjs';
import { BitRocketService } from '../../services/bit-rocket/bit-rocket.service';
import { RocketGameStatus } from './config';
import { Images } from './config';

const { Started, Launched, Crashed } = RocketGameStatus;

@Component({
  selector: 'app-bit-rocket',
  templateUrl: './bit-rocket.component.html',
  styleUrls: ['./bit-rocket.component.scss'],
})
export class BitRocketComponent implements OnInit, OnDestroy {
  canvasWidth: number;
  canvasHeight: number;
  maxWidth: number;

  subscriptions = {
    assetsLoaded: null,
    gameStatusChanged: null,
  };

  startUpTimer = null;
  startUpRemains = null;

  @ViewChild('canvasWrapper') canvasWrapper: ElementRef;

  constructor(public rocketService: BitRocketService) {
    this.subscriptions.assetsLoaded = this.rocketService.assetsLoaded.subscribe(() => {
      this.updateSize();
    });

    this.subscriptions.gameStatusChanged = this.rocketService.gameStatusChanged.subscribe(status => this.gameStatusChanged(status));
  }

  ngOnInit() {
    if (!this.rocketService.assetsReady) {
      this.rocketService.preloadAssets();
    } else {
      this.updateSize();
    }
  }

  ngOnDestroy() {
    if (this.subscriptions.assetsLoaded) {
      this.subscriptions.assetsLoaded.unsubscribe();
      this.subscriptions.assetsLoaded = null;
    }

    if (this.subscriptions.gameStatusChanged) {
      this.subscriptions.gameStatusChanged.unsubscribe();
      this.subscriptions.gameStatusChanged = null;
    }

    this.rocketService.initialize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateSize();
  }

  gameStatusChanged = status => {
    if (status === Started) {
      this.startUpRemains = Math.ceil(this.rocketService.startUpTime / 1000);
      this.startUpTimer = setInterval(() => {
        this.startUpRemains -= 1;
      }, 1000);
    } else if (status === Launched || status === Crashed) {
      this.startUpRemains = null;
      if (this.startUpTimer) {
        clearInterval(this.startUpTimer);
      }
    }
  }

  updateSize(): void {
    const w = window, d = document;
    const e = d.documentElement, g = d.getElementsByTagName('body')[0];
    const sh = w.innerHeight || e.clientHeight || g.clientHeight;

    this.canvasWidth = Math.max(1000, this.canvasWrapper.nativeElement.clientWidth);
    this.maxWidth = Images[0].width;
    this.canvasHeight = sh - 170;
  }

  get showMultiplier(): boolean {
    return this.rocketService.gameStatus === RocketGameStatus.Launched;
  }

  get showStartupTimer(): boolean {
    return this.rocketService.gameStatus === RocketGameStatus.Started;
  }
}
