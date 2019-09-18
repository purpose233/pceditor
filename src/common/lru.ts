import { RenderNode } from '../tree/renderNode';

interface TimeNode {
  node: RenderNode,
  time: number
}

export class LRU {

  private nodeStack: TimeNode[] = [];
  private loadedNodeNumber: number = 0;

  public updateNodeTime(node: RenderNode): void {
    const timeNode = this.sliceNode(node);
    if (timeNode) { 
      timeNode.time = new Date().getTime();
      this.nodeStack.push(timeNode);
    }
  }

  public loadNode(node: RenderNode): void {
    
  }

  private sliceNode(node: RenderNode): TimeNode | null {
    for (let i = 0; i < this.nodeStack.length; i++) {
      if (this.nodeStack[i].node === node) {
        return this.nodeStack.splice(i, 1)[0];
      }
    }
    return null;
  }
}
