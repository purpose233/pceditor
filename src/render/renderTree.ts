import { MNOTree } from '../tree/mnoTree';
import { MNONode } from '../tree/mnoNode';
import { RenderNode } from './renderNode';
import { Scene } from 'three';
import { BoundingBox } from '../common/bbox';

export class RenderTree extends MNOTree {

  constructor(bbox: BoundingBox) {
    super(RenderTree.createRootNode(bbox), bbox);
  }

  protected static createRootNode(bbox: BoundingBox): MNONode {
    return new RenderNode('0', bbox, null, false);
  }

  public unrender(scene: Scene): void {
    (this.rootNode as RenderNode).unrender(scene);
    this.unrenderChildren(scene, this.rootNode as RenderNode);
  }

  private unrenderChildren(scene: Scene, parent: RenderNode): void {
    for (const child of parent.getChildNodes() as RenderNode[]) {
      child.unrender(scene);
      this.unrenderChildren(scene, child);
    }
  }
}
