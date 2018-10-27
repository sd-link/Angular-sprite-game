export const Sounds = [
  { id: 'atmosphere', src: 'assets/bit-rocket/audios/atmosphere.ogg' },
  { id: 'crash-launch-alert', src: 'assets/bit-rocket/audios/crash-launch-alert.ogg' },
  { id: 'crash-launch-heat', src: 'assets/bit-rocket/audios/crash-launch-heat.ogg' },
  { id: 'crash-launch', src: 'assets/bit-rocket/audios/crash-launch.ogg' },
  { id: 'crash', src: 'assets/bit-rocket/audios/crash.ogg' },
  { id: 'launch', src: 'assets/bit-rocket/audios/launch.ogg' },
  { id: 'mars-approach', src: 'assets/bit-rocket/audios/mars-approach.ogg' },
  { id: 'mars', src: 'assets/bit-rocket/audios/mars.ogg' },
  { id: 'moon-approach', src: 'assets/bit-rocket/audios/moon-approach.ogg' },
  { id: 'moon', src: 'assets/bit-rocket/audios/moon.ogg' },
  { id: 'musk-voice', src: 'assets/bit-rocket/audios/musk-voice.ogg' },
  { id: 'rotate', src: 'assets/bit-rocket/audios/rotate.ogg' },
  { id: 'split', src: 'assets/bit-rocket/audios/split.ogg' },
];

export const Images = [
  { name: 'mountain', image: 'assets/bit-rocket/pngs/mountain.png', width: 1921, height: 617 },
  { name: 'silo', image: 'assets/bit-rocket/pngs/silo.png', width: 928, height: 403 },
  { name: 'rocket-full', image: 'assets/bit-rocket/pngs/rocket-full.png', width: 73, height: 323 },
  { name: 'rocket-body', image: 'assets/bit-rocket/pngs/rocket-body.png', width: 73, height: 230 },
  { name: 'rocket-mini', image: 'assets/bit-rocket/pngs/rocket-mini.png', width: 45, height: 105 },
  { name: 'rocket-smoke-cloud', image: 'assets/bit-rocket/sprites/rocket-smoke-cloud.png', width: 20250, height: 10 },
  { name: 'rocket-smoke-spread', image: 'assets/bit-rocket/sprites/rocket-smoke-spread.png', width: 480, height: 14700 },
  { name: 'rocket-crash-earch', image: 'assets/bit-rocket/sprites/rocket-crash-earth.png', width: 28000, height: 1093 },
  { name: 'moon', image: 'assets/bit-rocket/pngs/moon.png', width: 549, height: 549 },
  { name: 'mars', image: 'assets/bit-rocket/pngs/mars.png', width: 799, height: 799 },
];

export const StageScale = 0.75;

export const Sprites = {
  rocketSmokeCloud: {
    name: 'rocketSmokeCloud',
    framerate: 30,
    images: [''],
    frames: {
      regX: 0,
      regY: 0,
      width: 450,
      height: 110,
      count: 45,
    },
    animations: {
      start: [1, 44, 'start', 1, 'rocket-smoke-cloud'],
    },
  },

  rocketSmokeSpread: {
    name: 'rocketSmokeSpread',
    framerate: 30,
    images: [''],
    frames: {
      regX: 0,
      regY: 0,
      width: 480,
      height: 100,
      count: 147,
    },
    animations: {
      start: [1, 147, 'start', 1],
    },
  },

  trail: {
    name: 'trail',
    framerate: 15,
    images: ['assets/bit-rocket/sprites/trail.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 36,
      height: 300,
      count: 165,
    },
    animations: {
      start: [1, 59, 'full', 1],
      full: [60, 164, 'full', 1],
    },
  },

  trailMiniRocket: {
    name: 'trailMiniRocket',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/trail-mini-rocket.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 11,
      height: 140,
      count: 149,
    },
    animations: {
      start: [1, 148, 'start', 1],
    },
  },

  toMarsText: {
    name: 'toMarsText',
    framerate: 20,
    images: ['assets/bit-rocket/sprites/to-mars-text.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 450,
      height: 150,
      count: 56,
    },
    animations: {
      start: [1, 56, 'start', 1, 'to-mars-text'],
    },
  },

  toMarsElon: {
    framerate: 20,
    images: ['assets/bit-rocket/sprites/to-mars-elon.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 106,
      height: 400,
      count: 97,
    },
    animations: {
      start: [1, 97, 'start', 1],
    },
  },

  siloRadar: {
    name: 'siloRadar',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/silo-radar.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 200,
      height: 200,
      count: 99,
    },
    animations: {
      start: [1, 57, 'blink', 1],
      blink: [58, 85, 'blink', 1],
    },
  },

  rocketSplit: {
    name: 'rocketSplit',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/rocket-split.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 100,
      height: 650,
      count: 42,
    },
    animations: {
      start: [1, 42, 'start', 1, 'rocket-split'],
    },
  },

  rocketSmokeLaunch: {
    name: 'rocketSmokeLaunch',
    framerate: 15,
    images: ['assets/bit-rocket/sprites/rocket-smoke-launch.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 600,
      height: 300,
      count: 45,
    },
    animations: {
      start: [1, 45, 'start', 1, 'rocket-smoke-launch'],
    },
  },

  rocketMiniRotate: {
    name: 'rocketMiniRotate',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/rocket-min-rotate.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 60,
      height: 300,
      count: 113,
    },
    animations: {
      start: [1, 113, 'start', 1, 'rocket-mini-rotate'],
    },
  },

  rocketCrashLaunch: {
    name: 'rocketCrashLaunch',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/rocket-crash-launch.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 520,
      height: 574,
      count: 68,
    },
    animations: {
      start: [1, 67, 'start', 1],
    },
  },

  rocketCrashEarth: {
    name: 'rocketCrashEarth',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/rocket-crash-earth.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 700,
      height: 1093,
      count: 40,
    },
    animations: {
      start: [1, 22, 'crash', 1, 'crash-launch'],
      crash: [23, 39, 'start', 1, 'crash'],
    },
  },

  rocketCrashMars: {
    name: 'rocketCrashMars',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/rocket-crash-mars.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 700,
      height: 1093,
      count: 40,
    },
    animations: {
      start: [1, 22, 'crash', 1, 'crash-launch'],
      crash: [23, 39, 'start', 1, 'crash'],
    },
  },

  rocketCrashSpace: {
    name: 'rocketCrashSpace',
    framerate: 25,
    images: ['assets/bit-rocket/sprites/rocket-crash-space.png'],
    frames: {
      regX: 0,
      regY: 0,
      width: 700,
      height: 1093,
      count: 40,
    },
    animations: {
      start: [1, 22, 'crash', 1, 'crash-launch'],
      crash: [23, 39, 'start', 1, 'crash'],
    },
  },
};

export enum RocketStarConfig {
  MaxRadius = 2.0,
  MinRadiusScale = 0.3,
  MaxSpeed = 180,
  NormalSpeed = 4,
  Count = 100,
}

export enum RocketColors {
  Earth = '#2e0041',
  Atmosphere = '#540685',
  Space = '#100e1b',
  Moon = '#011232',
  Mars = '#67000c',
}

export enum RocketSpaces {
  Earth = 0,
  Atmosphere = 2,
  SpaceAtmoMoon = 4,
  MoonApproach = 90,
  Moon = 100,
  MoonSpeed = 0.5,
  SpaceMoonMars = 120,
  RocketSplit = 120,
  ToMarsText = 150,
  ToMarsElon = 160,
  MarsApproach = 950,
  Mars = 1000,
  MarsSpeed = 0.5,
  RocketRotating = 1200,
  SpaceAfterMars = 3550,
}

export enum RocketTiming {
  ResetDalay = 1000,
  RocketLaunch = 2500,
}

export enum RocketGameStatus {
  Configuring = 'BR_ROUND_CONFIGURING',
  Init = 'BR_ROUND_INIT',
  Started = 'BR_ROUND_STARTED',
  Launched = 'BR_ROUND_LAUNCHED',
  Crashed = 'BR_ROUND_CRASHED',
  AfterCrash = 'BR_ROUND_AFTER_CRASH',
}
