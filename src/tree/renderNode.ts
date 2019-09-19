import { BaseNode } from './baseNode';
import { BoundingBoxType } from '../common/types';
import { BasePoint } from './basePoint';
import { Points, Scene } from 'three';
import { createNodeMesh } from '../common/render';

export class RenderNode extends BaseNode {

  private mesh: Points | null = null;
  private isRendering: boolean = false;
  // private lastVisitTime: number = 0;
  // private isDirty: boolean = false;

  protected createNewNode(idx: string, bbox: BoundingBoxType, parentNode: null | BaseNode): BaseNode {
    return new RenderNode(idx, bbox, parentNode);
  };

  // public getMesh(): Points | null { return this.mesh; }

  // public setMesh(mesh: Points | null) { this.mesh = mesh; }

  public async load(): Promise<void> {
    await super.load();
    this.mesh = createNodeMesh(this);
  }

  public async unload(): Promise<void> {
    await super.unload();
    this.mesh = null;
  }

  public render(scene: Scene): void {
    if (!this.isLoaded || !this.mesh) { 
      console.log('Node has not loaded!')
      return; 
    }
    scene.add(this.mesh as Points);
    this.isRendering = true;
  }

  public unrender(scene: Scene): void {
    if (!this.isLoaded || !this.mesh) { 
      console.log('Node has not loaded!')
      return; 
    }
    scene.remove(this.mesh as Points);
    this.isRendering = false;
  }

  // public getLastVisitTime(): number { return this.lastVisitTime; }

  // public setLastVisitTime(time: number): void { this.lastVisitTime = time; }
}
