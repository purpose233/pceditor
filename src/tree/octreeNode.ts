export class OctreeNode {

  protected idx: string;
  protected parentNode: null | OctreeNode;
  protected childNodes: (null | OctreeNode)[] = [null,null,null,null,null,null,null,null];

  constructor(idx: string, parentNode: null | OctreeNode) {
    this.idx = idx;
    this.parentNode = parentNode;
  }

  public getChildNode(index: number): OctreeNode | null { return this.childNodes[index]; }

  public getChildNodes(): OctreeNode[] {
    const nodes: OctreeNode[] = [];
    if (this.childNodes) {
      for (const node of this.childNodes) {
        if (node) { nodes.push(node); }
      }
    }
    return nodes;
  }

  public getChildNodesWithNumber(): [number, OctreeNode][] {
    const nodes: [number, OctreeNode][] = [];
    if (this.childNodes) {
      for (let i = 0; i < 8; i++) {
        if (this.childNodes[i]) { 
          nodes.push([i, this.childNodes[i] as OctreeNode]); 
        }
      }
    }
    return nodes;
  }

  public setChildNode(index: number, node: OctreeNode): void { this.childNodes[index] = node; }

  public checkChildNodeExist(index: number): boolean { return !!this.childNodes[index]; }

  public getParentNode(): null | OctreeNode { return this.parentNode; }

  public removeChildNode(index: number): void { this.childNodes[index] = null; }

  public getChildrenMask(): number {
    let mask = 0;
    if (this.childNodes) {
      for (let i = 0; i < this.childNodes.length; i++) {
        mask = mask | (this.childNodes[i] ? 1 : 0) << i;
      }
    }
    return mask;
  }

  public getIdx(): string { return this.idx; }
}
