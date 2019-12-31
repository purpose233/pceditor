import { Scene, PerspectiveCamera, 
  WebGLRenderer, Color } from 'three';
// import { TrackballControls } from '../../lib/TrackballControls';
import { OrbitControls } from '../../lib/OrbitControls';
import Stats from 'stats.js';
import { PCRenderer } from './renderer';

export class PCScene {

  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private stats: Stats;
  private controls: OrbitControls;
  private pcRenderer: PCRenderer;
  private isEnabled: boolean = true;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, renderer: PCRenderer) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    // this.camera.position.set(0, 0, 5);
    this.camera.position.set(0, 10, 5);
    this.camera.lookAt(this.scene.position);
    this.camera.updateMatrix();
    this.pcRenderer = renderer;

    const context = canvas.getContext('webgl2') as WebGLRenderingContext;
    this.renderer = new WebGLRenderer({canvas: canvas, context: context});
    // this.renderer = new WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new Color(0x232323));
    // container.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    this.stats.dom.style.left = '280px';
    this.stats.dom.style.top = '10px';
    container.appendChild(this.stats.dom);

    // this.controls = new TrackballControls(this.camera, canvas);
    // this.controls.rotateSpeed = 1.0;
    // this.controls.zoomSpeed = 1.2;
    // this.controls.panSpeed = 0.8;
    // this.controls.noZoom = false;
    // this.controls.noPan = false;
    // this.controls.staticMoving = true;
    // this.controls.dynamicDampingFactor = 0.3;
    // this.controls.keys = [ 65, 83, 68 ];
    
    // Note that the control need to be added on the parent element of canvas, 
    //  so that it could be stopped by gizmo event callbacks.  
    this.controls = new OrbitControls(this.camera, canvas.parentElement as HTMLElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.keyPanSpeed = 20;

    window.addEventListener('resize', this.onWindowResize, false);

    // const gridHelper = new GridHelper(10, 10, new Color(0xffffff));
    // this.scene.add(gridHelper);

    this.animate();
  }

  public drop(container: HTMLElement): void {
    // stop animation
    this.isEnabled = false;
    this.renderer.clear();

    // remove stats
    this.stats.end();
    container.removeChild(this.stats.dom);
  }

  public getScene(): Scene { return this.scene; }

  public getCamera(): PerspectiveCamera { return this.camera; }

  private onWindowResize = async () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.controls.handleResize();
    await this.render();
  }

  private animate = async () => {
    if (!this.isEnabled) { return; }
    this.controls.update();
    this.stats.update();
    await this.render();
    requestAnimationFrame(this.animate);
  }

  // private onMouseDown = () => {}

  // private onMouseUp = () => {}

  // private onMouseMove = () => {}

  // private flag = true;
  private render = async () => {
    // Used for debugging
    // if (this.flag) {
    //   await this.pcRenderer.renderTree(this.scene, this.camera);
    // }
    // this.flag = false;
    await this.pcRenderer.renderTree(this.scene, this.camera);
    this.camera.updateMatrixWorld();
    this.renderer.render(this.scene, this.camera);
  }
}
