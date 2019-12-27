import { MNOTree } from '../tree/mnoTree';
import { ConverterNode } from './converterNode';
import { BoundingBox } from '../common/bbox';

export class ConverterTree extends MNOTree {

  constructor(refPath: string, bbox: BoundingBox) {
    super(refPath, ConverterTree.createRootNode(bbox), bbox);
    (this.rootNode as ConverterNode).setRefTree(this);
  }

  private loadedCount: number = 0;

  protected static createRootNode(bbox: BoundingBox): ConverterNode {
    return new ConverterNode('0', bbox, null, null, true);
  }

  public getLoadedCount(): number { return this.loadedCount; }

  public changeLoadedCount(diff: number) { this.loadedCount += diff; }

  // when refNode is not passed, function will serialize the total tree.
  public async unloadNodeTree(refNode: ConverterNode): Promise<void> {
    await this.unloadChildren(refNode);
    // TODO: this strategy will cause problems when the ancestor nodes 
    //  contains more points than threshold. This could be resolved by 
    //  changing the thredhold dynamicly.
    let currentNode: ConverterNode | null = refNode;
    while (currentNode && currentNode.getParentNode()) {
      const parent = currentNode.getParentNode() as ConverterNode;
      await this.unloadChildren(parent, false, [currentNode]);
      currentNode = parent;
    }
  }

  private async unloadChildren(parent: ConverterNode, unloadParent: boolean = false, 
                               excludeChildren: ConverterNode[] = []): Promise<void> {
    for (const child of (parent.getChildNodes() as ConverterNode[])) {
      if (!excludeChildren.includes(child)) {
        await this.unloadChildren(child, true, excludeChildren);
      }
    }
    if (unloadParent) {
      await parent.unload();
    }
  }
}
