import { Scene, PerspectiveCamera, Vector3, Matrix4 } from 'three';
import { RenderTree } from './renderTree';
import { RenderNode } from './renderNode';
import { LRU } from '../common/lru';
import { BaseSelector } from '../select/baseSelector';
import { SphereSelector } from '../select/sphereSelector';
import { DefaultSphereSelectorRadius } from '../common/constants';
import { calcWorldToCameraMatrix } from '../common/common';

// import * as THREE from 'three';

export class PCRenderer {

  private tree: RenderTree;
  private selector: BaseSelector | null = null;
  private lru: LRU = new LRU();
  private renderingNodes: Set<RenderNode> = new Set();
  private currentWtoCMatrix: Matrix4 = new Matrix4();

  constructor(tree: RenderTree) {
    this.tree = tree;
  }

  public async renderTotalTree(scene: Scene, camera: PerspectiveCamera): Promise<void> {
    // TODO: load all nodes
    await this.lru.requireNodes(this.tree.getAllNodes() as RenderNode[]);
    this.renderNodesTree(this.tree.getRootNode() as RenderNode, scene, camera);
  }

  public async renderTree(scene: Scene, camera: PerspectiveCamera): Promise<void> {
    this.currentWtoCMatrix = calcWorldToCameraMatrix(camera);
    const nodes = this.calcRenderNodes(this.tree.getRootNode() as RenderNode, camera);
    // console.log('count: ' + nodes.length);

    // Hide unrequired nodes which are loaded but needn't to show.
    const iter = this.renderingNodes.values();
    let result;
    while (!(result = iter.next()).done) {
      const node: RenderNode = result.value;
      if (!nodes.includes(node)) { this.hideNode(node, scene, camera); }
    }

    // Load & render required nodes.
    await this.lru.requireNodes(nodes);
    for (const node of nodes) {
      this.showNode(node, scene, camera);
    }

    if (this.selector === null) {
      this.selector = new SphereSelector(this.tree, scene, new Vector3(0,0,0), DefaultSphereSelectorRadius);
      this.selector.render(scene, false);
      console.log(scene);
      console.log(this.selector);
      console.log(this.tree);
    } else {
      this.selector.completeSelectTree(scene);
    }

    // clear recentLoaded flag after updating is done
    for (const node of nodes) {
      node.setNotRecentLoaded();
    }
  }
  
  public hideNode(node: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    node.unrender(scene);
    this.renderingNodes.delete(node);
  }

  // private flag = true;
  // private points: any[] = [];
  // private windows: any[] = [];
  public showNode(node: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    // Used for debugging
    // if (node.getIdx() === '0') {
    //   const mt = new THREE.Matrix4();
    //   mt.set(1,0,0,camera.position.x,
    //         0,1,0,camera.position.y,
    //         0,0,1,camera.position.z,
    //         0,0,0,1);
    //   const mz = new THREE.Matrix4();
    //   const { x: rx, y: ry, z: rz } = camera.rotation;
    //   mz.set(Math.cos(-rz),-Math.sin(-rz),0,0,
    //           Math.sin(-rz),Math.cos(-rz),0,0,
    //           0,0,1,0,
    //           0,0,0,1);
    //   const mx = new THREE.Matrix4();
    //   mx.set(1,0,0,0,
    //           0,Math.cos(-rx),-Math.sin(-rx),0,
    //           0,Math.sin(-rx),Math.cos(-rx),0,
    //           0,0,0,1);
    //   const my = new THREE.Matrix4();
    //   my.set(Math.cos(-ry),0,Math.sin(-ry),0,
    //           0,1,0,0,
    //           -Math.sin(-ry),0,Math.cos(-ry),0,
    //           0,0,0,1);
    //   const m = mz.multiply(my).multiply(mx);
    //   const vertices = node.getBBox().getVertices();
    //   if (this.flag) {
    //     const planeHalfHeight = 1 * Math.tan(camera.fov / 2) * 5;
    //     const planeHalfWidth = planeHalfHeight * camera.aspect;
    //     var geometry = new THREE.SphereBufferGeometry(0.1, 3, 3);
    //     var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    //     var sphere = new THREE.Mesh(geometry, material);
    //     sphere.position.set(planeHalfWidth, planeHalfHeight, -5);
    //     this.windows.push(sphere);
    //     scene.add(sphere);
    //     sphere = new THREE.Mesh(geometry, material);
    //     sphere.position.set(planeHalfWidth, -planeHalfHeight, -5);
    //     this.windows.push(sphere);
    //     scene.add(sphere);
    //     sphere = new THREE.Mesh(geometry, material);
    //     sphere.position.set(-planeHalfWidth, planeHalfHeight, -5);
    //     this.windows.push(sphere);
    //     scene.add(sphere);
    //     sphere = new THREE.Mesh(geometry, material);
    //     sphere.position.set(-planeHalfWidth, -planeHalfHeight, -5);
    //     this.windows.push(sphere);
    //     scene.add(sphere);
  
    //     for (const vertex of vertices) {
    //       // var geometryLine = new THREE.Geometry();
    //       // geometryLine.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
    //       vertex.applyMatrix4(m);
    //       vertex.divideScalar(Math.abs(vertex.z));
    //       // geometryLine.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
    //       // var materialLine = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    //       // var line = new THREE.Line( geometryLine, materialLine );
    //       // scene.add(line);
  
    //       var geometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
    //       var material = new THREE.MeshBasicMaterial({color: 0xffff00});
    //       var sphere = new THREE.Mesh(geometry, material);
    //       sphere.position.set(vertex.x, vertex.y, vertex.z);
    //       scene.add(sphere);
    //       this.points.push(sphere);
    //     }
    //     this.flag = false;
    //   } else {
    //     let i = 0;
    //     for (const vertex of vertices) {
    //       vertex.applyMatrix4(m);
    //       // vertex.divideScalar(Math.abs(vertex.z) / 5);
    //       this.points[i].position.set(vertex.x, vertex.y, vertex.z);
    //       i++;
    //     }
    //   }
    // }

    node.render(scene);
    // node.renderBBox(scene);
    this.renderingNodes.add(node);
  }
 
  private renderNodesTree(root: RenderNode, scene: Scene, camera: PerspectiveCamera): void {
    this.showNode(root, scene, camera);
    const childNodes = root.getChildNodes();
    for (const child of childNodes as RenderNode[]) {
      this.renderNodesTree(child, scene, camera);
    }
  }

  private checkLoD(node: RenderNode, camera: PerspectiveCamera): boolean { 
    // TODO: need to be improved
    // always show root node
    if (node.getIdx() === '0') { return true; }
    const bbox = node.getBBox();
    if (!bbox.checkInFrustum(camera, this.currentWtoCMatrix)) { return false; }
    const distance = bbox.calcDistanceToPosition(camera.position);
    if (distance >= 3 * bbox.getSizeMaxScalar()) { return false; }
    return true;
  }

  // get nodes which need to be rendered by calculation LoD
  private calcRenderNodes(root: RenderNode, camera: PerspectiveCamera): RenderNode[] {
    const nodes: RenderNode[] = [];
    if (this.checkLoD(root, camera)) {
      nodes.push(root);
      for (const node of root.getChildNodes() as RenderNode[]) {
        nodes.push(...this.calcRenderNodes(node, camera));
      }
    }
    return nodes;
  }
}
