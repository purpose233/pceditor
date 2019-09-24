import { MNONode } from '../tree/mnoNode';
import { BoundingBoxType } from '../common/types';
import { MNOPoint } from '../tree/mnoPoint';
import { Points, Scene } from 'three';
import { createNodeMesh } from '../common/render';
import { deserializeNode } from '../common/serialize';
import { ExportDataPath } from '../common/constants';

export class RenderNode extends MNONode {

  private mesh: Points | null = null;
  private isRendering: boolean = false;
  // private isDirty: boolean = false;

  protected createNewNode(idx: string, bbox: BoundingBoxType, parentNode: null | MNONode): MNONode {
    return new RenderNode(idx, bbox, parentNode);
  };

  // public getMesh(): Points | null { return this.mesh; }

  // public setMesh(mesh: Points | null) { this.mesh = mesh; }

  public async load(): Promise<void> {
    if (this.isLoaded) { return; }
    await deserializeNode(ExportDataPath + this.idx, this);
    this.isLoaded = true;
    this.mesh = createNodeMesh(this);
  }

  public async unload(): Promise<void> {
    await super.unload();
    this.mesh = null;
  }

  public render(scene: Scene): void {
    if (this.isRendering) { return; }
    if (!this.isLoaded || !this.mesh) { 
      console.log('Node has not loaded!')
      return; 
    }
    scene.add(this.mesh as Points);
    this.isRendering = true;
  }

  public unrender(scene: Scene): void {
    if (!this.isRendering) { return; }
    if (!this.isLoaded || !this.mesh) { 
      console.log('Node has not loaded!')
      return; 
    }
    scene.remove(this.mesh as Points);
    this.isRendering = false;
  }

  public checkIsRendering(): boolean { return this.isRendering; }
}
