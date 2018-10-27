import { EventEmitter, Injectable } from '@angular/core';
import { LoadQueue } from 'createjs-module';
import { Images, RocketGameStatus, Sounds, Sprites } from '../../app/bit-rocket/config';

const { Configuring, Init, Started, Launched, Crashed, AfterCrash } = RocketGameStatus;

@Injectable()
export class BitRocketService {
  queue = null;
  sounds = null;
  assetsReady = false;
  imagesLoaded = false;
  soundsLoaded = false;
  loadedSoundCount = 0;
  gameStatus = Init;

  multiplier = 0;

  startUpTime = 5000;
  multiplierEqu = {
    base: 2,
    coefficient: 0.0001,
  };

  audioMuteConfig = {
    sound: false,
    music: false,
  };

  gameStatusChanged: EventEmitter<any> = new EventEmitter<any>();
  assetsLoaded: EventEmitter<any> = new EventEmitter<any>(false);

  crashMultiplier;

  constructor() {}

  initialize(): void {
    this.setMultiplier(0);
    this.gameStatus = Init;
    this.stopSound();
  }

  preloadAssets(): void {
    if (this.queue && this.sounds && this.assetsReady) {
      return;
    }

    this.queue = null;
    this.assetsReady = false;

    const manifest = [];

    Images.forEach(item => {
      const { name, image } = item;
      manifest.push({ id: name, src: image });
    });

    Object.keys(Sprites).forEach(key => {
      const { images, name } = Sprites[key];
      if (images[0] !== '') {
        manifest.push({ id: `${name}_sprite`, src: images[0] });
      }
    });

    this.queue = new LoadQueue();
    this.queue.on('complete', () => {
      this.imagesLoaded = true;
      if (this.soundsLoaded) {
        this.assetsReady = true;
        this.assetsLoaded.emit(true);
      }
    });
    this.queue.loadManifest(manifest);

    this.sounds = createjs.Sound;
    this.sounds.registerPlugins([createjs.WebAudioPlugin]);
    this.sounds.alternateExtensions = ['mp3'];
    this.sounds.registerSounds(Sounds);

    this.sounds.addEventListener('fileload', () => {
      this.loadedSoundCount ++;
      if (this.loadedSoundCount === Sounds.length) {
        this.soundsLoaded = true;
        if (this.imagesLoaded) {
          this.assetsReady = true;
          this.assetsLoaded.emit(true);
        }
      }
    });
  }

  playSound(id: string, volume: number = 1): void {
    this.sounds.volume = volume;
    this.sounds.play(id);
  }

  stopSound(id?: string): void {
    if (id) {
      this.sounds.stop(id);
    } else {
      this.sounds.stop();
    }
  }

  setGameStatus(status: RocketGameStatus): void {
    this.gameStatus = status;
    if (status === Started) {
      this.setMultiplier(0);
      this.crashMultiplier = Math.random() * 5;
      if (this.crashMultiplier < 1) {
        this.crashMultiplier = 1;
      }
      console.log(this.crashMultiplier);
    }
    this.gameStatusChanged.emit(status);
  }

  setMultiplier(multiplier: number): void {
    this.multiplier = multiplier;
    if (this.multiplier > this.crashMultiplier) {
      this.setGameStatus(Crashed);
    }
  }
}
