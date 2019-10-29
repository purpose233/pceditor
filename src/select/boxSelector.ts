import { ShapeSelector } from './shapeSelector';
import { Vector3, Line, Scene, Camera, Object3D, LineBasicMaterial, VertexColors, BufferGeometry, Float32BufferAttribute } from 'three';
import { SelectorColor, MinBoxSelectorSize, DefaultBoxSelectorSize } from '../common/constants';
import { RenderTree } from '../render/renderTree';
import { RenderPoint } from '../render/renderPoint';
import { RenderNode } from '../render/renderNode';
import { PositionGizmo } from './gizmo/positionGizmo';
import { AxisType } from '../common/types';
import { SizeGizmo } from './gizmo/resizeGizmo';
import { BoundingBox } from '../common/bbox';

export class BoxSelector extends ShapeSelector {

  private size: Vector3;
  private positionGizmo: PositionGizmo;
  private sizeGizmo: SizeGizmo;

  constructor(refTree: RenderTree, scene: Scene, camera: Camera, 
              center: Vector3, size: Vector3) {
    super(refTree, scene, center, BoxSelector.createMesh(center, size));
    this.size = size;
    
    const gizmoSize = this.size.clone().divideScalar(2);
    this.positionGizmo = new PositionGizmo(scene, camera, center, gizmoSize);
    this.positionGizmo.addDragMoveCB(this.onPositionGizmoDragMove.bind(this));
    this.positionGizmo.addDragEndCB(this.onPositionGizmoDragMove.bind(this));
    this.positionGizmo.enable(scene);
    
    this.sizeGizmo = new SizeGizmo(scene, camera, center, gizmoSize);
    this.sizeGizmo.addDragMoveCB(this.onSizeGizmoDragMove.bind(this));
    this.sizeGizmo.addDragEndCB(this.onSizeGizmoDragMove.bind(this));
    this.sizeGizmo.enable(scene);
    
    this.updateSelectTree(scene);
  }

  public unrender(scene: Scene): void {
    super.unrender(scene);
    this.positionGizmo.disable(scene);
    this.sizeGizmo.disable(scene);
  }

  public resize(scene: Scene, size: Vector3) {
    if (size.x > MinBoxSelectorSize) { this.size.setX(size.x); }
    if (size.y > MinBoxSelectorSize) { this.size.setY(size.y); }
    if (size.z > MinBoxSelectorSize) { this.size.setZ(size.z); }
    this.isUpdated = true;
    this.updateSelectTree(scene);
  }

  // for now, rotation is not been considered
  public checkNodeInSelector(node: RenderNode): boolean {
    const diff = node.getCenter().clone().sub(this.center.clone());
    const nodeSize = node.getBBox().getSize();
    return (Math.abs(diff.x) < this.size.x + nodeSize.x) && 
           (Math.abs(diff.y) < this.size.y + nodeSize.y) &&
           (Math.abs(diff.z) < this.size.z + nodeSize.z);
  }

  public checkPointInSelector(point: RenderPoint): boolean {
    const diff = point.getPosition().clone().sub(this.center.clone());
    return (Math.abs(diff.x) < this.size.x / 2) && 
           (Math.abs(diff.y) < this.size.y / 2) && 
           (Math.abs(diff.z) < this.size.z / 2);
  }

  protected updateMesh(): void {
    this.mesh = BoxSelector.createMesh(this.center, this.size);
  }

  private static createMesh(center: Vector3, size: Vector3): Object3D {
    const bbox = new BoundingBox(size.clone().negate().divideScalar(2), size.clone().divideScalar(2));
    const vertices = bbox.getVertices();
    const material = new LineBasicMaterial({vertexColors: VertexColors});
    let geometry = new BufferGeometry();
    geometry.addAttribute('position', new Float32BufferAttribute([
      vertices[0].x, vertices[0].y, vertices[0].z,
      vertices[1].x, vertices[1].y, vertices[1].z,
      vertices[3].x, vertices[3].y, vertices[3].z,
      vertices[2].x, vertices[2].y, vertices[2].z,
      vertices[0].x, vertices[0].y, vertices[0].z,
      vertices[4].x, vertices[4].y, vertices[4].z,
      vertices[5].x, vertices[5].y, vertices[5].z,
      vertices[1].x, vertices[1].y, vertices[1].z,
    ], 3));
		geometry.addAttribute('color', new Float32BufferAttribute([
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
    ], 3));
    const line = new Line(geometry, material);
    geometry = new BufferGeometry();
    geometry.addAttribute('position', new Float32BufferAttribute([
      vertices[2].x, vertices[2].y, vertices[2].z,
      vertices[6].x, vertices[6].y, vertices[6].z,
      vertices[7].x, vertices[7].y, vertices[7].z,
      vertices[3].x, vertices[3].y, vertices[3].z,
    ], 3));
    geometry.addAttribute('color', new Float32BufferAttribute([
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
    ], 3));
    line.add(new Line(geometry, material));
    geometry = new BufferGeometry();
    geometry.addAttribute('position', new Float32BufferAttribute([
      vertices[4].x, vertices[4].y, vertices[4].z,
      vertices[6].x, vertices[6].y, vertices[6].z,
    ], 3));
    geometry.addAttribute('color', new Float32BufferAttribute([
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
    ], 3));
    line.add(new Line(geometry, material));
    geometry = new BufferGeometry();
    geometry.addAttribute('position', new Float32BufferAttribute([
      vertices[7].x, vertices[7].y, vertices[7].z,
      vertices[5].x, vertices[5].y, vertices[5].z,
    ], 3));
    geometry.addAttribute('color', new Float32BufferAttribute([
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
      SelectorColor.r, SelectorColor.g, SelectorColor.b,
    ], 3));
    line.add(new Line(geometry, material));
    return line;
  }

  private onPositionGizmoDragMove(axis: AxisType, deltaOffset: number, totalOffset: number): void {
    const newCenter = this.center.clone();
    switch (axis) {
      case 'x': newCenter.add(new Vector3(deltaOffset, 0, 0)); break;
      case 'y': newCenter.add(new Vector3(0, deltaOffset, 0)); break;
      case 'z': newCenter.add(new Vector3(0, 0, deltaOffset)); break;
    }
    this.positionGizmo.relocate(this.scene, newCenter);
    this.sizeGizmo.relocate(this.scene, newCenter);
    this.relocate(this.scene, newCenter);
    this.render(this.scene);
  }

  private onSizeGizmoDragMove(axis: AxisType, deltaOffset: number, totalOffset: number): void {
    const size = this.size.clone();
    switch (axis) {
      case 'x': 
        size.x = size.x + deltaOffset < MinBoxSelectorSize ? 
          MinBoxSelectorSize : size.x + deltaOffset;
        break;
      case 'y':
        size.y = size.y + deltaOffset < MinBoxSelectorSize ? 
          MinBoxSelectorSize : size.y + deltaOffset; 
        break;
      case 'z': 
        size.z = size.z + deltaOffset < MinBoxSelectorSize ? 
          MinBoxSelectorSize : size.z + deltaOffset;
        break;
    }
    this.sizeGizmo.resize(this.scene, size.clone().divideScalar(2));
    this.resize(this.scene, size);
    this.render(this.scene);
  }
}

export function createDefaultBoxSelector(refTree: RenderTree, 
  scene: Scene, camera: Camera): BoxSelector {
  return new BoxSelector(refTree, scene, camera, new Vector3(0, 0, 0), 
    new Vector3(DefaultBoxSelectorSize, DefaultBoxSelectorSize, DefaultBoxSelectorSize));
}
