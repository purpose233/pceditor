import { OctreeTree } from '../tree/octreeTree';
import { SelectNode } from './selectNode';
import { RenderTree } from '../render/renderTree';
import { RenderNode } from '../render/renderNode';
import { OctreeNode } from '../tree/octreeNode';
import { Scene } from 'three';

export class SelectTree extends OctreeTree {

  // private selector: BaseSelector;
  // Whether the select tree has been changed.
  // private isDirty: boolean = false;

  constructor(refMNOTree: RenderTree) {
    // do not need to get ref path from SelectTree
    super('', SelectTree.createRootNode(refMNOTree));
  }
  
  protected static createRootNode(refMNOTree: RenderTree): SelectNode {
    const mnoRoot = refMNOTree.getRootNode() as RenderNode;
    return new SelectNode(mnoRoot.getIdx(), null, mnoRoot);
  }

  public clearTree(): void {
    this.travelNodes((node: OctreeNode): void => {
      (node as SelectNode).setClean();
    });
  }

  public dirtyTree(): void {
    this.travelNodes((node: OctreeNode): void => {
      (node as SelectNode).setDirty();
    });
  }

  public unreachTree(): void {
    this.dirtyTree();
    this.travelNodes((node: OctreeNode): void => {
      (node as SelectNode).setUnreached();
    });
  }

  public removeUnreachedNodes(): void {
    this.removeChildren(this.rootNode as SelectNode);
  }

  // updateTreeRender should only be called by selector classes
  public updateTreeRender(scene: Scene): void {
    (this.rootNode as SelectNode).updateRender(scene);
  }
  
  private removeChildren(node: SelectNode): void {
    for (const childWithNumber of node.getChildNodesWithNumber() as [number, SelectNode][]) {
      if (childWithNumber[1].checkIsReached()) {
        this.removeChildren(childWithNumber[1]);
      } else {
        node.removeChildNode(childWithNumber[0]);
      }
    }
  }
}
