import { Mesh, Vector3, Scene } from 'three';

// TODO: fix the hard code
const dom = document.getElementById('canvas') as HTMLElement;

export abstract class BaseGizmo {

  // protected refObject: Object3D;
  protected xMesh: Mesh;
  protected yMesh: Mesh;
  protected zMesh: Mesh;
  // position attribute is used in resize function after new meshes are created
  protected position: Vector3;
  protected isEnabled: boolean = false;
  protected mouseDownCB: (e: MouseEvent) => void;
  protected mouseMoveCB: (e: MouseEvent) => void;
  protected mouseUpCB: (e: MouseEvent) => void;

  constructor (position: Vector3, size: Vector3) {
    this.position = position;
    const meshes = this.createMeshes(size);
    this.xMesh = meshes.x;
    this.yMesh = meshes.y;
    this.zMesh = meshes.z;
    // In order to unite the paramater of relocate function, relocate function 
    //  cannot be called without scene paremeter (even it won't be used).
    this.xMesh.position.set(position.x, position.y, position.z);
    this.yMesh.position.set(position.x, position.y, position.z);
    this.zMesh.position.set(position.x, position.y, position.z);
    
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
  };
  
  public disable(scene: Scene): void {
    if (!this.isEnabled) { return; }
    dom.removeEventListener('mousedown', this.mouseDownCB);
    dom.removeEventListener('mousemove', this.mouseMoveCB);
    dom.removeEventListener('mouseup', this.mouseUpCB);
    this.hide(scene);
    this.isEnabled = false;
  };

  // TODO: maybe add EventDispatch class for this
  // public addDragStartCB(): void;
  
  // public addDragMoveCB(): void;
  
  // public addDragEndCB(): void;
  
  public resize(scene: Scene, size: Vector3): void {
    if (this.isEnabled) {
      this.hide(scene);
    }
    const meshes = this.createMeshes(size);
    this.xMesh = meshes.x;
    this.yMesh = meshes.y;
    this.zMesh = meshes.z;
    this.relocate(scene, this.position);
    if (this.isEnabled) {
      this.show(scene);
    }
  }

  public relocate(scene: Scene, position: Vector3): void {
    this.xMesh.position.set(position.x, position.y, position.z);
    this.yMesh.position.set(position.x, position.y, position.z);
    this.zMesh.position.set(position.x, position.y, position.z);
  }

  protected abstract onMouseDown(event: MouseEvent): void;

  protected abstract onMouseMove(event: MouseEvent): void;

  protected abstract onMouseUp(event: MouseEvent): void;

  protected abstract createMeshes(size: Vector3): {x: Mesh, y: Mesh, z: Mesh};
  
  protected show(scene: Scene): void {
    scene.add(this.xMesh);
    scene.add(this.yMesh);
    scene.add(this.zMesh);
  }

  protected hide(scene: Scene): void {
    scene.remove(this.xMesh);
    scene.remove(this.yMesh);
    scene.remove(this.zMesh);
  }
}
