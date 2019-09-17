import { PCTreeNode } from '../tree/pcTreeNode';

interface TimeNode {
  node: PCTreeNode,
  time: number
}

export class LRU {

  private nodeStack: TimeNode[] = [];
  private loadedNodeNumber: number = 0;

  public updateNodeTime(node: PCTreeNode): void {
    const timeNode = this.sliceNode(node);
    if (timeNode) { 
      timeNode.time = new Date().getTime();
      this.nodeStack.push(timeNode);
    }
  }

  public loadNode(node: PCTreeNode): void {
    
  }

  private sliceNode(node: PCTreeNode): TimeNode | null {
    for (let i = 0; i < this.nodeStack.length; i++) {
      if (this.nodeStack[i].node === node) {
        return this.nodeStack.splice(i, 1)[0];
      }
    }
    return null;
  }
}
