import { BaseTree } from '../tree/baseTree';
import { ConverterNode } from './converterNode';
import { BoundingBoxType } from '../common/types';

export class ConverterTree extends BaseTree {

  private loadedCount: number = 0;

  protected createRootNode(bbox: BoundingBoxType): ConverterNode {
    return new ConverterNode('0', bbox, null, this);
  }

  public getLoadedCount(): number { return this.loadedCount; }

  public changeLoadedCount(diff: number) { this.loadedCount += diff; }

  // when refNode is not passed, function will serialize the total tree.
  public async serialize(refNode?: ConverterNode): Promise<void> {
    if (refNode) {
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
    } else {
      await this.unloadChildren(this.getRootNode() as ConverterNode, true);
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
