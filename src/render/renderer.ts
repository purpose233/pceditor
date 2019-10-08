import { Scene, PerspectiveCamera, Vector3 } from 'three';
import { RenderTree } from './renderTree';
import { RenderNode } from './renderNode';
import { LRU } from '../common/lru';
import { BaseSelector } from '../select/baseSelector';
import { SphereSelector } from '../select/sphereSelector';
import { DefaultSphereSelectorRadius } from '../common/constants';

import * as THREE from 'three'

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

  private flag = true;

  public renderNode(node: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    if (this.flag) {
      const mt = new THREE.Matrix4();
      mt.set(1,0,0,-camera.position.x,
            0,1,0,-camera.position.y,
            0,0,1,-camera.position.z,
            0,0,0,1);
      const mz = new THREE.Matrix4();
      const { x: rx, y: ry, z: rz } = camera.rotation;
      mz.set(Math.cos(-rz),-Math.sin(-rz),0,0,
             Math.sin(-rz),Math.cos(-rz),0,0,
             0,0,1,0,
             0,0,0,1);
      const mx = new THREE.Matrix4();
      mx.set(1,0,0,0,
             0,Math.cos(-rx),-Math.sin(-rx),0,
             0,Math.sin(-rx),Math.cos(-rx),0,
             0,0,0,1);
      const my = new THREE.Matrix4();
      my.set(Math.cos(-ry),0,Math.sin(-ry),0,
             0,1,0,0,
             -Math.sin(-ry),0,Math.cos(-ry),0,
             0,0,0,1);
      const m = mx.multiply(my).multiply(mz).multiply(mt);

      const vertices = node.getBBox().getVertices();
      for (const vertex of vertices) {
        var geometryLine = new THREE.Geometry();
        geometryLine.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
        vertex.applyMatrix4(m);
        // vertex.applyMatrix4(mz);
        // vertex.applyMatrix4(my);
        // vertex.applyMatrix4(mx);
        vertex.divideScalar(Math.abs(vertex.z));
        // vertex.applyMatrix4(camera.matrixWorld);
        geometryLine.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
        var materialLine = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        var line = new THREE.Line( geometryLine, materialLine );
        scene.add(line);

        var geometry = new THREE.SphereBufferGeometry(0.2, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(vertex.x, vertex.y, vertex.z);
        // console.log(vertex);
        scene.add(sphere);
      }
      this.flag = false;
    }

    node.render(scene);
    node.renderBBox(scene);
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
    const bbox = node.getBBox();
    if (!bbox.checkInFrustum(camera)) { 
      console.log(node.getIdx());
      return false; }
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
