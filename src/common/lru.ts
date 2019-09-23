import { RenderNode } from '../tree/renderNode';
import { MaxRenderNodes } from './constants';

export class LRU {

  private loadedNodeStack: RenderNode[] = [];

  public updateNodeTime(node: RenderNode): void {
    this.sliceNode(node);
    this.loadedNodeStack.push(node);
  }

  public async loadNodes(nodes: RenderNode[]): Promise<void> {
    // TODO: handle when nodes number greater than MaxRenderNodes
    for (const node of nodes) {
      await this.loadNode(node);
    }
  }

  public async loadNode(node: RenderNode): Promise<void> { 
    await node.load();
    this.updateNodeTime(node);
    this.unloadOverflowedNodes();
  }

  private async unloadOverflowedNodes(): Promise<void> {
    while (this.loadedNodeStack.length > MaxRenderNodes) {
      const node = this.loadedNodeStack.shift() as RenderNode;
      await node.unload();
    }
  }

  private sliceNode(node: RenderNode): RenderNode | null {
    for (let i = 0; i < this.loadedNodeStack.length; i++) {
      if (this.loadedNodeStack[i] === node) {
        return this.loadedNodeStack.splice(i, 1)[0];
      }
    }
    return null;
  }
}
