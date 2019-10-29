import { BaseSelector } from './baseSelector';
import { Vector3, Scene, Object3D } from 'three';
import { RenderTree } from '../render/renderTree';

export abstract class ShapeSelector extends BaseSelector {

  protected mesh: Object3D;
  protected center: Vector3;

  constructor(refTree: RenderTree, scene: Scene, center: Vector3, mesh: Object3D) {
    super(refTree, scene);
    this.center = center;
    this.mesh = mesh;
  }

  public getCenter(): Vector3 { return this.center.clone(); }

  // TODO: whether rerendering should to be called by selector itself?
  public relocate(scene: Scene, position: Vector3): void {
    this.center.set(position.x, position.y, position.z);
    this.updateSelectTree(scene);
  }

  public render(scene: Scene): void {    
    if (this.isUpdated) {
      this.scene.remove(this.mesh);
      this.updateMesh();
      this.isUpdated = false;
    }
    // TODO: Use relocate function or just modify in relocate function
    this.mesh.position.set(this.center.x, this.center.y, this.center.z);
    
    scene.add(this.mesh);
    this.isRendering = true;
  }

  public unrender(scene: Scene): void {
    if (!this.isRendering) { return; }
    scene.remove(this.mesh);
    this.isRendering = false;
  }

  protected abstract updateMesh(): void;
}
