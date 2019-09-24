export class OctreeNode {

  protected idx: string;
  protected parentNode: null | OctreeNode;
  protected childNodes: (null | OctreeNode)[] = [null,null,null,null,null,null,null,null];

  constructor(idx: string, parentNode: null | OctreeNode) {
    this.idx = idx;
    this.parentNode = parentNode;
  }

  public getChildNodes(): OctreeNode[] {
    const nodes: OctreeNode[] = [];
    if (this.childNodes) {
      for (const node of this.childNodes) {
        if (node) { nodes.push(node); }
      }
    }
    return nodes;
  }

  public getParentNode(): null | OctreeNode { return this.parentNode; }

  public setChildNode(index: number, node: OctreeNode) { this.childNodes[index] = node; }

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