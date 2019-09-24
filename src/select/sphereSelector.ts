import { SelectTree } from './selectTree';
import { BaseSelector } from './baseSelector';
import { Vector3, LineBasicMaterial, LineLoop, Line, CircleGeometry, Scene } from 'three';
import { DefaultSphereSelectorRadius, UnselectedSelectorColor, DefaultSphereSelectorSegments } from '../common/constants';
import { RenderTree } from '../render/renderTree';
import { RenderPoint } from '../render/renderPoint';
import { RenderNode } from '../render/renderNode';
import { getVerticesOfBBox } from '../common/render';

export class SphereSelector extends BaseSelector {

  private center: Vector3;
  private radius: number;
  private selectedMesh: Line;
  private unselectedMesh: Line;
  // private controlMesh:

  constructor(refTree: RenderTree, center: Vector3, radius: number) {
    super(refTree);
    this.center = center;
    this.radius = radius;
    this.selectedMesh = SphereSelector.createMesh(center, radius, true);
    this.unselectedMesh = SphereSelector.createMesh(center, radius, false);
  }

  public relocate(scene: Scene, position: Vector3): void {
    // The mesh is referring the center vector, it's not necessary to rerenderer.
    this.center.set(position.x, position.y, position.z);
    this.updateSelectTree();
  }

  public resize(scene: Scene, radius: number): void {
    this.radius = radius;
    this.updateSelectTree();
    this.render(scene, true, true);
  }

  public checkNodeInSelector(node: RenderNode): boolean {
    const vertices = getVerticesOfBBox(node.getBBox());
    for (const vertex of vertices) {
      if (this.center.distanceTo(vertex) <= this.radius) {
        return true;
      }
    }
    return false;
  }

  public checkPointInSelector(point: RenderPoint): boolean {
    return this.center.distanceTo(point.getPosition()) <= this.radius;
  }

  public updateSelectTree(): void {
    
  }

  public select(scene: Scene): void {
    scene.remove(this.unselectedMesh);
    scene.add(this.selectedMesh);
  }

  public unselected(scene: Scene): void {
    scene.remove(this.selectedMesh);
    scene.add(this.unselectedMesh);
  }

  private render(scene: Scene, isFocused: boolean, isUpdated: boolean): void {
    if (isUpdated) {
      this.selectedMesh = SphereSelector.createMesh(this.center, this.radius, true);
      this.unselectedMesh = SphereSelector.createMesh(this.center, this.radius, false);
    }
    scene.remove(this.selectedMesh);
    scene.remove(this.unselectedMesh);
  }

  private static createMesh(center: Vector3, radius: number, isSelected: boolean): Line {
    const material = new LineBasicMaterial({color: UnselectedSelectorColor}),
    geometry = new CircleGeometry(radius, DefaultSphereSelectorSegments);
    // Remove center vertex
    geometry.vertices.shift();
    let line = new LineLoop(geometry, material);
    const parent = new Line();
    parent.add(line);
    line = new LineLoop(geometry, material);
    line.rotateY(Math.PI / 2);
    parent.add(line);
    line = new LineLoop(geometry, material);
    line.rotateX(Math.PI / 2)
    parent.add(line);
    parent.position = center;
    return parent;
  }
}

export function createSphereSelectorFromPoint(point: RenderPoint, tree: RenderTree): SphereSelector {
  return new SphereSelector(tree, point.getPosition(), DefaultSphereSelectorRadius);
}
