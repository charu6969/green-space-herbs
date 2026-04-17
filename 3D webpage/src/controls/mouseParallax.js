// mouseParallax.js — Smooth camera parallax from mouse movement
import { lerp } from '../utils/helpers.js';

export class MouseParallax {
  constructor(camera) {
    this.camera = camera;
    this.mouse = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.lerpFactor = 0.03;
    this.strengthX = 0.8;
    this.strengthY = 0.4;
    this.baseCameraPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

    this._onMouseMove = this._onMouseMove.bind(this);
    window.addEventListener('mousemove', this._onMouseMove);
  }

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  update() {
    this.target.x = this.mouse.x * this.strengthX;
    this.target.y = this.mouse.y * this.strengthY;

    this.camera.position.x = lerp(this.camera.position.x, this.baseCameraPos.x + this.target.x, this.lerpFactor);
    this.camera.position.y = lerp(this.camera.position.y, this.baseCameraPos.y + this.target.y, this.lerpFactor);

    this.camera.lookAt(0, 0, 0);
  }

  dispose() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}
