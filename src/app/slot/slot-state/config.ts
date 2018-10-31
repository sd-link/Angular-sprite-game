export const DiceNames = 
  [ 'mintleaf', 'bitcoin', 'bear', 'penguin', 'mountain', 
    'mintdice1', 'mintdice2', 'mintdice3', 'mintdice4', 'mintdice5', 'mintdice6', 
    'dice1', 'dice2', 'dice3', 'dice4', 'dice5', 'dice6'];

export const FallingDices = 4;

export enum TextStyle {
  fontFamily = 'EnzoOT-Bold',
  fontSizeLarge = 70,
  fontSizeMedium = 40,
  fontSizeSmall = 30
}

export enum AnimationTiming {
  TextIn = 400,
  TextOut = 400,
  TextDelay = 800,
  TextCounting = 2000,
  DiceFallingInterval = 500,
  DiceFallingDuration = 2000
}

export enum GameStatus {
  Success = 'SUCCESS',
  Fail = 'FAIL',
  Play = 'PLAY'
}

export enum GameText {
  Play = 'PLAY!',
  TryAgain = 'Try again!',
  BTC = 'BTC',
  LastWinning = 'Last winning'
}

 

 