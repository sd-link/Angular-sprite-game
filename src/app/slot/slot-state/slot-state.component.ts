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
  

  @ViewChild('wrapper') wrapper: ElementRef;

  constructor() { }

  ngOnInit() {
    this.app = new PIXI.Application({
      width: 320,         // default: 800
      height: 320,        // default: 600
      antialias: true,    // default: false
      transparent: false, // default: false
      resolution: 1       // default: 1
    });
    this.wrapper.nativeElement.appendChild(this.app.view);
    console.log(this.app.view)

    PIXI.loader.add('bunny', 'assets/slots/sprites/dice-flow.png').load((loader, resources) => {
      // This creates a texture from a 'bunny.png' image
      const bunny = new PIXI.Sprite(resources.bunny.texture);
  
      // Setup the position of the bunny
      bunny.x = this.app.renderer.width / 2;
      bunny.y = this.app.renderer.height / 2;
  
      // Rotate around the center
      bunny.anchor.x = 0.5;
      bunny.anchor.y = 0.5;
  
      // Add the bunny to the scene we are building
      this.app.stage.addChild(bunny);
  
      // Listen for frame updates
      this.app.ticker.add(() => {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;
      });
    });
  }

}
