import { Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, 
  PointsMaterial, Points, VertexColors } from 'three';
import { PCTree } from '../tree/pcTree';
import { PCTreeNode } from '../tree/pcTreeNode';
import { PCTreePoint } from '../tree/pcTreePoint';

export class PCTreeRenderer {

  private tree: PCTree;

  constructor(tree: PCTree) {
    this.tree = tree;
  }

  public renderTree(scene: Scene, camera: PerspectiveCamera): void {
    this.renderNodes(this.tree.getRootNode(), scene, camera);
  }

  public renderNode(node: PCTreeNode, scene: Scene, camera: PerspectiveCamera): void {
    const pointCount = node.getPointCount();
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    node.travelPoints((p: PCTreePoint, i: number): void => {
      const position = p.getPosition();
      positions[3 * i] = position.x;
      positions[3 * i + 1] = position.y;
      positions[3 * i + 2] = position.z;
      colors[3 * i] = 1;
      colors[3 * i + 1] = 1;
      colors[3 * i + 2] = 1
    });
    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(positions, 3));
    geometry.addAttribute('color', new BufferAttribute(colors, 3));
    geometry.computeBoundingBox();
    const material = new PointsMaterial({size: 0.05, vertexColors: VertexColors});
    const mesh = new Points(geometry, material);
    scene.add(mesh);
  }

  private renderNodes(node: PCTreeNode, scene: Scene, camera: PerspectiveCamera): void {
    this.renderNode(node, scene, camera);
    const childNodes = node.getChildNodes();
    for (const child of childNodes) {
      this.renderNodes(child, scene, camera);
    }
  }
}
