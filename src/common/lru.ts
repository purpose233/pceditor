import { RenderNode } from '../render/renderNode';
import { MaxRenderNodes } from './constants';

export class LRU {

  private loadedNodeStack: RenderNode[] = [];
  private recentUnloadedNodes: RenderNode[] = [];

  public getLoadedNodesCount(): number {
    return this.loadedNodeStack.length;
  }

  public getRecentUnloadedNodes(): RenderNode[] { return this.recentUnloadedNodes; }

  public updateNodeTime(node: RenderNode): void {
    const index = this.loadedNodeStack.indexOf(node);
    if (index >= 0) {
      this.loadedNodeStack.splice(index, 1);
      this.loadedNodeStack.push(node);
    }
  }

  // requireNodes means one operation, which will always loads all nodes in parameter,
  //  even when node number is greater than MaxRenderNodes.
  public async requireNodes(nodes: RenderNode[]): Promise<void> {
    for (let i = 0; i < this.loadedNodeStack.length; i++) {
      if (nodes.includes(this.loadedNodeStack[i])) {
        this.loadedNodeStack.splice(i, 1);
        i--;
      }
    }
    this.recentUnloadedNodes = await this.unloadOverflowedNodes(
      nodes.length < MaxRenderNodes ? MaxRenderNodes - nodes.length : 0);
    for (const node of nodes) {
      await node.load();
      this.loadedNodeStack.push(node);
    }
  }

  // loadNodes will unload nodes when stack overflows.
  // public async loadNodes(nodes: RenderNode[]): Promise<void> {
  //   // TODO: check the repeated nodes
  //   for (const node of nodes) {
  //     await this.loadNode(node);
  //   }
  // }

  // private async loadNode(node: RenderNode): Promise<void> { 
  //   await node.load();
  //   this.updateNodeTime(node);
  // }

  private async unloadOverflowedNodes(max?: number): Promise<RenderNode[]> {
    const nodes: RenderNode[] = [];
    const threshold = max !== undefined ? max : MaxRenderNodes;
    while (this.loadedNodeStack.length > threshold) {
      const node = this.loadedNodeStack.shift() as RenderNode;
      await node.unload();
      nodes.push(node);
    }
    return nodes;
  }
}
