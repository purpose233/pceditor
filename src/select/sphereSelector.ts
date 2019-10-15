import { SelectTree } from './selectTree';
import { BaseSelector } from './baseSelector';
import { Vector3, LineBasicMaterial, LineLoop, Line, CircleGeometry, Scene } from 'three';
import { DefaultSphereSelectorRadius, UnselectedSelectorColor, DefaultSphereSelectorSegments, SelectedSelectorColor } from '../common/constants';
import { RenderTree } from '../render/renderTree';
import { RenderPoint } from '../render/renderPoint';
import { RenderNode } from '../render/renderNode';
import { PositionGizmo } from './gizmo/positionGizmo';

export class SphereSelector extends BaseSelector {

  private center: Vector3;
  private radius: number;
  private selectedMesh: Line;
  private unselectedMesh: Line;
  private positionGizmo: PositionGizmo;
  // private controlMesh:

  constructor(refTree: RenderTree, scene: Scene, center: Vector3, radius: number) {
    super(refTree);
    this.center = center;
    this.radius = radius;
    this.selectedMesh = SphereSelector.createMesh(center, radius, true);
    this.unselectedMesh = SphereSelector.createMesh(center, radius, false);
    this.updateSelectTree(scene);
    this.positionGizmo = new PositionGizmo(center, new Vector3(radius, radius, radius));

    this.positionGizmo.enable(scene);

    // TODO: add transparent shape for selector
    // var geometry = new THREE.SphereBufferGeometry(DefaultSphereSelectorRadius, 32, 32);
    // var material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.2, transparent: true});
    // var sphere = new THREE.Mesh(geometry, material);
    // scene.add(sphere);
  }

  // TODO: whether rerendering should to be called by selector itself?
  public relocate(scene: Scene, position: Vector3): void {
    this.center.set(position.x, position.y, position.z);
    this.isUpdated = true;
    this.updateSelectTree(scene);
  }

  public resize(scene: Scene, radius: number): void {
    this.radius = radius;
    this.isUpdated = true;
    this.updateSelectTree(scene);
    // this.render(scene, true, true);
  }

  public checkNodeInSelector(node: RenderNode): boolean {
    // TODO: maybe add '=' for all comparison
    const bbox = node.getBBox();
    const { x, y, z } = this.center;
    const { x: minX, y: minY, z: minZ } = bbox.getMin();
    const { x: maxX, y: maxY, z: maxZ } = bbox.getMax();

    // check 6 faces of bbox
    if (x > minX && x < maxX && y < minY && y > maxY 
        && z > (minZ - this.radius) && z < (maxZ + this.radius)) {
      return true;
    }
    if (x > minX && x < maxX && z > minZ && z < maxZ 
        && y > (minY - this.radius) && y < (maxY + this.radius)) {
      return true;
    }
    if (y < minY && y > maxY && z > minZ && z < maxZ 
        && x > (minX - this.radius) && x < (maxX + this.radius)) {
      return true;
    }

    // check 8 vertices of bbox
    const vertices = bbox.getVertices();
    for (const vertex of vertices) {
      if (this.center.distanceTo(vertex) <= this.radius) {
        return true;
      }
    }

    //check 12 edges of bbox
    const r2 = this.radius * this.radius;
    if (x > minX && x < maxX) {
      if ((y - minY) ** 2 + (z - minZ) ** 2 < r2) {
        return true;
      }
      if ((y - minY) ** 2 + (z - maxZ) ** 2 < r2) {
        return true;
      }
      if ((y - maxY) ** 2 + (z - minZ) ** 2 < r2) {
        return true;
      }
      if ((y - maxY) ** 2 + (z - maxZ) ** 2 < r2) {
        return true;
      }
    }
    if (y > minY && y < maxY) {
      if ((x - minX) ** 2 + (z - minZ) ** 2 < r2) {
        return true;
      }
      if ((x - minX) ** 2 + (z - maxZ) ** 2 < r2) {
        return true;
      }
      if ((x - maxX) ** 2 + (z - minZ) ** 2 < r2) {
        return true;
      }
      if ((x - maxX) ** 2 + (z - maxZ) ** 2 < r2) {
        return true;
      }
    }
    if (z > minZ && z < maxZ) {
      if ((y - minY) ** 2 + (x - minX) ** 2 < r2) {
        return true;
      }
      if ((y - minY) ** 2 + (x - maxX) ** 2 < r2) {
        return true;
      }
      if ((y - maxY) ** 2 + (x - minX) ** 2 < r2) {
        return true;
      }
      if ((y - maxY) ** 2 + (x - maxX) ** 2 < r2) {
        return true;
      }
    }

    return false;
  }

  public checkPointInSelector(point: RenderPoint): boolean {
    return this.center.distanceTo(point.getPosition()) <= this.radius;
  }

  // public updateSelectTree(): void {
    
  // }

  public select(scene: Scene): void {
    scene.remove(this.unselectedMesh);
    scene.add(this.selectedMesh);
  }

  public unselected(scene: Scene): void {
    scene.remove(this.selectedMesh);
    scene.add(this.unselectedMesh);
  }

  public render(scene: Scene, isFocused: boolean): void {
    super.render(scene, isFocused);
    if (this.isUpdated) {
      this.selectedMesh = SphereSelector.createMesh(this.center, this.radius, true);
      this.unselectedMesh = SphereSelector.createMesh(this.center, this.radius, false);
    }
    if (isFocused) {
      scene.remove(this.unselectedMesh);
      scene.add(this.selectedMesh);
    } else {
      scene.remove(this.selectedMesh);
      scene.add(this.unselectedMesh);
    }
  }

  // TODO: use transparent sphere instead
  private static createMesh(center: Vector3, radius: number, isSelected: boolean): Line {
    const material = new LineBasicMaterial({color: isSelected ? SelectedSelectorColor : UnselectedSelectorColor});
    const geometry = new CircleGeometry(radius, DefaultSphereSelectorSegments);
    // Remove center vertex
    geometry.vertices.shift();
    let line = new LineLoop(geometry, material);
    // If creating a empty line, "Render count or primcount is 0" warining will occur.
    // const parent = new Line();
    // parent.add(line);
    const parent = line;
    line = new LineLoop(geometry, material);
    line.rotateY(Math.PI / 2);
    parent.add(line);
    line = new LineLoop(geometry, material);
    line.rotateX(Math.PI / 2)
    parent.add(line);
    parent.position.set(center.x, center.y, center.z);
    return parent;
  }
  // private static createControlMesh(center: Vector3, radius: number)
}

export function createSphereSelectorFromPoint(scene: Scene, point: RenderPoint, tree: RenderTree): SphereSelector {
  return new SphereSelector(tree, scene, point.getPosition(), DefaultSphereSelectorRadius);
}
