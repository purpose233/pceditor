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

  public travelNodes(handler: (node: OctreeNode) => void) {
    this.handleNodeRecursively(this.rootNode, handler);
  }

  private handleNodeRecursively(node: OctreeNode, handler: (node: OctreeNode) => void): void {
    handler(node);
    for (const childNode of node.getChildNodes() as OctreeNode[]) {
      this.handleNodeRecursively(node, handler);
    }
  }
}
