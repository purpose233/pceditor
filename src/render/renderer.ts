import { Scene, PerspectiveCamera, Vector3 } from 'three';
import { RenderTree } from './renderTree';
import { RenderNode } from './renderNode';
import { LRU } from '../common/lru';
import { BaseSelector } from '../select/baseSelector';
import { SphereSelector } from '../select/sphereSelector';
import { DefaultSphereSelectorRadius } from '../common/constants';
import { BoundingBox } from '../common/bbox';

export class PCRenderer {

  private tree: RenderTree;
  private selector: BaseSelector | null = null;
  private lru: LRU = new LRU();

  constructor(tree: RenderTree) {
    this.tree = tree;
  }

  public async renderTotalTree(scene: Scene, camera: PerspectiveCamera): Promise<void> {
    // TODO: load all nodes
    await this.lru.loadNodes(this.tree.getAllNodes() as RenderNode[]);
    this.renderNodesTree(this.tree.getRootNode() as RenderNode, scene, camera);
  }

  public async renderTree(scene: Scene, camera: PerspectiveCamera): Promise<void> {
    const nodes = this.calcRenderNodes(this.tree.getRootNode() as RenderNode, camera);
    await this.lru.loadNodes(nodes);
    for (const node of nodes) {
      this.renderNode(node, scene, camera);
    }

    if (this.selector === null) {
      this.selector = new SphereSelector(this.tree, scene, new Vector3(0,0,0), DefaultSphereSelectorRadius);
      this.selector.render(scene, false);
      console.log(scene);
      console.log(this.selector);
      console.log(this.tree);
    }
  }
  
  public hideNode(node: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    node.unrender(scene);
  }

  public renderNode(node: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    node.render(scene);
  }
 
  private renderNodesTree(root: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    this.renderNode(root, scene, camera);
    const childNodes = root.getChildNodes();
    for (const child of childNodes as RenderNode[]) {
      this.renderNodesTree(child, scene, camera);
    }
  }

  private checkLoD(node: RenderNode, camera: PerspectiveCamera): boolean { 
    // TODO: need to be improved
    // const bbox = node.getBBox();
    // if (!bbox.checkInFrustum(camera)) { return false; }
    // const distance = bbox.calcDistanceToPosition(camera.position);
    // // if (distance <= 3 * Math.max()
    return true;
  }

  // get nodes which need to be rendered by calculation LoD
  private calcRenderNodes(root: RenderNode, camera: PerspectiveCamera): RenderNode[] {
    const nodes: RenderNode[] = [];
    if (this.checkLoD(root, camera)) {
      nodes.push(root);
    }
    // TODO: whether stop searching in node children when parent node is dropped?
    for (const node of root.getChildNodes() as RenderNode[]) {
      nodes.push(...this.calcRenderNodes(node, camera));
    }
    return nodes;
  }
}
