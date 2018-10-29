import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
//import * as PIXI from 'pixi.js';

declare var PIXI:any;

@Component({
  selector: 'app-slot-state',
  templateUrl: './slot-state.component.html',
  styleUrls: ['./slot-state.component.css']
})
export class SlotStateComponent implements OnInit {
  public app: any;
  
  readyAssets: boolean;
  spriteRolling: any;

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
    .load((loader, resources) => {
      this.readyAssets = true;
      
      let frames = [];
      ​
      for (let i = 0; i < 58; i++) {
        let val = i < 10 ? '0' + i : i;
  ​      frames.push(PIXI.Texture.fromFrame('Square_000' + val));
      }
  ​
      this.spriteRolling = new PIXI.extras.AnimatedSprite(frames);

      this.spriteRolling.anchor.set(0.5);
      this.spriteRolling.animationSpeed = 0.5;
      this.spriteRolling.play();
  ​
      this.app.stage.addChild(this.spriteRolling);
  ​
      // Animate the rotation
      this.app.ticker.add(() => {
        this.spriteRolling.rotation += 0.01;
      });
    });

    // PIXI.loader.add('bunny', 'assets/slots/sprites/dice-flow.png').load((loader, resources) => {
    //   // This creates a texture from a 'bunny.png' image
    //   const bunny = new PIXI.Sprite(resources.bunny.texture);
  
    //   // Setup the position of the bunny
    //   bunny.x = this.app.renderer.width / 2;
    //   bunny.y = this.app.renderer.height / 2;
  
    //   // Rotate around the center
    //   bunny.anchor.x = 0.5;
    //   bunny.anchor.y = 0.5;
  
    //   // Add the bunny to the scene we are building
    //   this.app.stage.addChild(bunny);
  
    //   // Listen for frame updates
    //   this.app.ticker.add(() => {
    //     // each frame we spin the bunny around a bit
    //     bunny.rotation += 0.01;
    //   });
    // });
  }

}
