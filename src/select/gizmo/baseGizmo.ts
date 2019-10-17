import { Mesh, Vector3, Scene, Vector2, Object3D, Camera, Raycaster } from 'three';
import { AxisType, GizmoMeshesType } from '../../common/types';
import { EventEmitter } from 'events';

// TODO: fix the hard code
const dom = document.getElementById('canvas') as HTMLElement;

export const DragStartEventName: string = 'dragstart';
export const DragMoveEventName: string  = 'dragmove';
export const DragEndEventName: string   = 'dragend';

export abstract class BaseGizmo {

  // TODO: fix the memory leaking of EventEmitter
  protected emitter: EventEmitter = new EventEmitter();
  // TODO: fix the poor design of scene and camera attributes
  protected scene: Scene;
  protected camera: Camera;
  // protected refObject: Object3D;
  protected xMesh: Mesh;
  protected yMesh: Mesh;
  protected zMesh: Mesh;
  protected xHighlightMesh: Mesh;
  protected yHighlightMesh: Mesh;
  protected zHighlightMesh: Mesh;
  // position attribute is used in resize function after new meshes are created
  protected position: Vector3;
  protected size: Vector3;
  protected isEnabled: boolean = false;
  protected highlightedAxis: AxisType | null = null;
  protected currentAxis: AxisType | null = null;
  protected totalOffset: number = 0;
  protected rayCaster: Raycaster = new Raycaster();

  protected mouseDownCB: (e: MouseEvent) => void;
  protected mouseMoveCB: (e: MouseEvent) => void;
  protected mouseUpCB: (e: MouseEvent) => void;

  constructor (scene: Scene, camera: Camera, position: Vector3, size: Vector3) {
    this.scene = scene;
    this.camera = camera;
    this.position = position;
    this.size = size;
    const meshes = this.createMeshes(size);
    this.xMesh = meshes.x;
    this.yMesh = meshes.y;
    this.zMesh = meshes.z;
    this.xHighlightMesh = meshes.xh;
    this.yHighlightMesh = meshes.yh;
    this.zHighlightMesh = meshes.zh;
    this.relocate(scene, position);
    
    this.mouseDownCB = this.onMouseDown.bind(this);
    this.mouseMoveCB = this.onMouseMove.bind(this);
    this.mouseUpCB = this.onMouseUp.bind(this);
  }

  public enable(scene: Scene): void {
    if (this.isEnabled) { return; }
    dom.addEventListener('mousedown', this.mouseDownCB);
    dom.addEventListener('mousemove', this.mouseMoveCB);
    dom.addEventListener('mouseup', this.mouseUpCB);
    this.show(scene);
    this.isEnabled = true;
  }

  public disable(scene: Scene): void {
    if (!this.isEnabled) { return; }
    dom.removeEventListener('mousedown', this.mouseDownCB);
    dom.removeEventListener('mousemove', this.mouseMoveCB);
    dom.removeEventListener('mouseup', this.mouseUpCB);
    this.hide(scene);
    this.isEnabled = false;
  }

  public addDragStartCB(cb: (axis: AxisType) => void): void {
    this.emitter.on(DragStartEventName, cb);
  }
  
  public addDragMoveCB(cb: (axis: AxisType, deltaOffset: number, totalOffset: number) => void): void {
    this.emitter.on(DragMoveEventName, cb);
  }
  
  public addDragEndCB(cb: (axis: AxisType, deltaOffset: number, totalOffset: number) => void): void {
    this.emitter.on(DragEndEventName, cb);
  }
  
  public resize(scene: Scene, size: Vector3): void {
    if (this.isEnabled) {
      this.hide(scene);
    }
    const meshes = this.createMeshes(size);
    this.xMesh = meshes.x;
    this.yMesh = meshes.y;
    this.zMesh = meshes.z;
    this.xHighlightMesh = meshes.xh;
    this.yHighlightMesh = meshes.yh;
    this.zHighlightMesh = meshes.zh;
    this.size.set(size.x, size.y, size.z);
    this.relocate(scene, this.position);
    if (this.isEnabled) {
      this.show(scene);
    }
  }

  public abstract relocate(scene: Scene, position: Vector3): void;

  // public relocate(scene: Scene, position: Vector3): void {
  //   this.xMesh.position.set(position.x, position.y, position.z);
  //   this.yMesh.position.set(position.x, position.y, position.z);
  //   this.zMesh.position.set(position.x, position.y, position.z);
  //   this.xHighlightMesh.position.set(position.x, position.y, position.z);
  //   this.yHighlightMesh.position.set(position.x, position.y, position.z);
  //   this.zHighlightMesh.position.set(position.x, position.y, position.z);
  // }

  protected abstract onMouseDown(event: MouseEvent): void;

  protected abstract onMouseMove(event: MouseEvent): void;

  protected abstract onMouseUp(event: MouseEvent): void;

  protected abstract createMeshes(size: Vector3): GizmoMeshesType;

  protected highlight(scene: Scene, axis: AxisType): void {
    if (this.highlightedAxis === axis) { return; }
    this.hide(scene);
    this.highlightedAxis = axis;
    this.show(scene);
  }

  protected unhighlight(scene: Scene): void {
    if (this.highlightedAxis === null) { return; }
    this.hide(scene);
    this.highlightedAxis = null;
    this.show(scene);
  }

  protected show(scene: Scene): void {
    scene.add(this.highlightedAxis === 'x' ? this.xHighlightMesh : this.xMesh);
    scene.add(this.highlightedAxis === 'y' ? this.yHighlightMesh : this.yMesh);
    scene.add(this.highlightedAxis === 'z' ? this.zHighlightMesh : this.zMesh);
  }

  protected hide(scene: Scene): void {
    scene.remove(this.highlightedAxis === 'x' ? this.xHighlightMesh : this.xMesh);
    scene.remove(this.highlightedAxis === 'y' ? this.yHighlightMesh : this.yMesh);
    scene.remove(this.highlightedAxis === 'z' ? this.zHighlightMesh : this.zMesh);
  }

  protected calcMouse(event: MouseEvent): Vector2 {
    const mouse: Vector2 = new Vector2();
    const rect = dom.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return mouse;
  }

  protected getMeshes(isHighlighted: boolean = false): Mesh[] { 
    return isHighlighted ? [this.xHighlightMesh, this.yHighlightMesh, this.zHighlightMesh] : 
                           [this.xMesh, this.yMesh, this.zMesh]; 
  }

  protected determineAxis(selected: Object3D): AxisType | null {
    switch(selected) {
      case this.xMesh: return 'x';
      case this.yMesh: return 'y';
      case this.zMesh: return 'z';
      default: return selected.parent ? this.determineAxis(selected.parent) : null;
    }
  }

  protected intersectObject(event: MouseEvent): Object3D | null {
    const mouse = this.calcMouse(event);
    this.rayCaster.setFromCamera(mouse, this.camera);
    const intersects = this.rayCaster.intersectObjects(this.getMeshes(), true);
    if (intersects.length > 0) { return intersects[0].object }
    else { return null; }
  }
}
