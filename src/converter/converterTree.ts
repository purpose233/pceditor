import { BaseTree } from '../tree/baseTree';
import { ConverterNode } from './converterNode';

export class ConverterTree extends BaseTree {

  private loadedCount: number = 0;

  public getLoadedCount(): number { return this.loadedCount; }

  public changeLoadedCount(diff: number) { this.loadedCount += diff; }

  // when refNode is not passed, function will serialize the total tree.
  public serialize(refNode?: ConverterNode): void {
    if (refNode) {
      this.unloadChildren(refNode);
      // TODO: this strategy will cause problems when the ancestor nodes 
      //  contains more points than threshold. This could be resolved by 
      //  changing the thredhold dynamicly.
      let currentNode: ConverterNode | null = refNode;
      while (currentNode && currentNode.getParentNode()) {
        const parent = currentNode.getParentNode() as ConverterNode;
        this.unloadChildren(parent, false, [currentNode]);
        currentNode = parent;
      }
    } else {
      this.unloadChildren(this.getRootNode() as ConverterNode, true);
    }
  }

  private unloadChildren(parent: ConverterNode, unloadParent: boolean = false, excludeChildren: ConverterNode[] = []): void {
    for (const child of (parent.getChildNodes() as ConverterNode[])) {
      if (!excludeChildren.includes(child)) {
        this.unloadChildren(child, true, excludeChildren);
      }
    }
    if (unloadParent) {
      parent.unload();
    }
  }
}
