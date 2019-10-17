import { OctreeNode } from './octreeNode';

export abstract class OctreeTree {

  protected rootNode: OctreeNode;

  constructor (rootNode: OctreeNode) {
    this.rootNode = rootNode;
  }

  public getRootNode(): OctreeNode { return this.rootNode; }

  public getAllNodes(): OctreeNode[] {
    // TODO: maybe set this as private function
    function getSubNodes(node: OctreeNode): OctreeNode[] {
      const nodes = [node];
      for (const childNode of node.getChildNodes()) {
        nodes.push(...getSubNodes(childNode));
      }
      return nodes;
    }
    return getSubNodes(this.rootNode);
  }

  public getNodeByIdx(idx: string): OctreeNode | null {
    const depth = idx.length;
    if (depth <= 0 && idx[0] !== '0') { return null; }
    if (depth === 1) { return this.rootNode; }
    let node: OctreeNode | null = this.rootNode;
    for (let i = 1; i < depth; i++) {
      node = (node as OctreeNode).getChildNode(Number.parseInt(idx[i]));
      if (!node) { return null; }
    }
    return node;
  }

  public travelNodes(handler: (node: OctreeNode) => void) {
    this.handleNodeRecursively(this.rootNode, handler);
  }

  private handleNodeRecursively(node: OctreeNode, handler: (node: OctreeNode) => void): void {
    handler(node);
    for (const childNode of node.getChildNodes() as OctreeNode[]) {
      this.handleNodeRecursively(childNode, handler);
    }
  }
}
