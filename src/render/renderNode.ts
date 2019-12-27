import { MNONode } from '../tree/mnoNode';
import { Points, Scene, BufferGeometry, BufferAttribute, 
  PointsMaterial, VertexColors, Line, 
  Color, Box3, Box3Helper, Vector3 } from 'three';
import { deserializeNode, serializeNode } from '../common/serialize';
import { DefaultPointSize, SelectedPointColor, BBoxColor, OutlineRatio, OutlineColor, ExportTempPostfix } from '../common/constants';
import { RenderPoint } from './renderPoint';
import { MNOPoint } from '../tree/mnoPoint';
import { BoundingBox } from '../common/bbox';
import { RenderTree } from './renderTree';

export class RenderNode extends MNONode {

  private mesh: Points | null = null;
  private bboxMesh: Line | null = null;
  // TODO: maybe remove isRendering flag
  private isRendering: boolean = false;
  private isBBoxRendering: boolean = false;
  // whether the node is recently loaded
  private recentLoaded: boolean = false;
  // whether the node is modified by deleting/adding operation
  // when node is modified, it will relate to temp file
  private isModified = false;
  // used for debugging
  private isForceUnrender: boolean = false;

  constructor(idx: string, bbox: BoundingBox, 
              parentNode: null | RenderNode, refTree: RenderTree | null,
              isNew: boolean = true) {
    super(idx, bbox, parentNode, refTree, isNew);
  }

  protected createNewNode(idx: string, bbox: BoundingBox, parentNode: null | RenderNode): MNONode {
    return new RenderNode(idx, bbox, parentNode, this.refTree as RenderTree);
  };

  public getFilePath(): string {
    const exportDataPath = (this.refTree as RenderTree).getRefDataPath(this.idx);
    return this.isModified ? exportDataPath + ExportTempPostfix : exportDataPath;
  }

  public async load(withoutMesh: boolean = false): Promise<void> {
    if (this.isLoaded) { return; }
    // console.log('load node: ' + this.idx);
    await deserializeNode(this.getFilePath(), this);
    this.isLoaded = true;
    this.recentLoaded = true;
    if (!withoutMesh) { this.mesh = this.createMesh(); }
  }

  public async unload(): Promise<void> {
    if (this.isModified) {
      serializeNode((this.refTree as RenderTree).getRefDataPath(this.idx) + ExportTempPostfix, this);
    }
    // isLoaded will be set false in parent function
    await super.unload();
    if (this.isRendering) { console.log('unload rendering node'); }
    // console.log('unload node: ' + this.idx);
    this.recentLoaded = false;
    this.mesh = null;
  }

  public render(scene: Scene): void {
    if (this.isRendering || this.isForceUnrender) { return; }
    if (!this.isLoaded || !this.mesh) { 
      console.log('Rendered node has not loaded!')
      return; 
    }
    scene.add(this.mesh as Points);
    if (this.isBBoxRendering) { this.renderBBox(scene); }
    this.isRendering = true;
  }

  public unrender(scene: Scene): void {
    if (!this.isRendering) { return; }
    if (!this.isLoaded || !this.mesh) { 
      console.log('Unrendered node has not loaded!')
      return; 
    }
    scene.remove(this.mesh as Points);
    if (this.isBBoxRendering && this.bboxMesh) { scene.remove(this.bboxMesh); }
    this.isRendering = false;
  }

  public forceUnrender(scene: Scene): void {
    this.isForceUnrender = true;
    this.unrender(scene);
  }

  public unforceUnrender(scene: Scene): void {
    this.isForceUnrender = false;
  }

  public updateRender(scene: Scene): void {
    if (!this.isLoaded) { return; }
    if (this.isRendering) { scene.remove(this.mesh as Points); }
    this.mesh = this.createMesh();
    if (this.isRendering) { scene.add(this.mesh as Points); }
  }

  public checkIsRendering(): boolean { return this.isRendering; }

  public checkRecentLoaded(): boolean { return this.recentLoaded; }

  public setNotRecentLoaded(): void { this.recentLoaded = false; }

  public renderBBox(scene: Scene): void {
    if (!this.bboxMesh) {
      this.bboxMesh = this.createBBoxMesh();
    }
    scene.add(this.bboxMesh);
    this.isBBoxRendering = true;
  }

  public unrenderBBox(scene: Scene): void {
    if (this.bboxMesh) {
      scene.remove(this.bboxMesh);
    }
    this.isBBoxRendering = false;
  }

  // TODO: temporarily stash the deletion until the node is loaded, 
  //  or loading the node to handle deletion.

  public deleteGridPoint(gridNumber: number): RenderPoint | null {
    const point = this.grid.get(gridNumber);
    if (point) {
      this.pointCount--;
      this.grid.delete(gridNumber);
      this.isModified = true;
      const index = this.findPointIndexByOrder(gridNumber);
      if (index !== -1) { this.gridByOrder.splice(index, 1); }
    }
    return point ? point as RenderPoint : null;
  }

  public deleteStackPoint(point: RenderPoint, stackNumber: number): void {
    const stack = this.pointStacks[stackNumber];
    if (stack.includes(point)) {
      this.pointCount--;
      stack.splice(stack.indexOf(point), 1);
      this.isModified = true;
    }
  }

  public deleteStackPoints(points: RenderPoint[], stackNumber: number): void {
    for (const point of points) {
      this.deleteStackPoint(point, stackNumber);
    }
  }

  private createMesh(): Points {
    const pointCount = this.getPointCount();
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    this.travelPoints((p: MNOPoint, i: number): void => {
      const position = p.getPosition();
      const color = p.getColor();
      positions[3 * i] = position.x;
      positions[3 * i + 1] = position.y;
      positions[3 * i + 2] = position.z;
      if ((p as RenderPoint).checkIsSelected()) {
        colors[3 * i] = SelectedPointColor.r;
        colors[3 * i + 1] = SelectedPointColor.g;
        colors[3 * i + 2] = SelectedPointColor.b;
      } else {
        colors[3 * i] = color.r;
        colors[3 * i + 1] = color.g;
        colors[3 * i + 2] = color.b;
      }
    });
    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(positions, 3));
    geometry.addAttribute('color', new BufferAttribute(colors, 3));
    geometry.computeBoundingBox();
    const outlineMaterial = new PointsMaterial({size: DefaultPointSize * OutlineRatio, color: OutlineColor});
    const outlineMesh = new Points(geometry, outlineMaterial);
    const material = new PointsMaterial({size: DefaultPointSize, vertexColors: VertexColors});
    const mesh = new Points(geometry, material);
    mesh.add(outlineMesh);
    return mesh;
  }

  private createBBoxMesh(): Box3Helper {
    const box = new Box3();
    const min = this.bbox.getMin(), max = this.bbox.getMax();
    box.setFromCenterAndSize(
      new Vector3((max.x + min.x) / 2, (max.y + min.y) / 2, (max.z + min.z) / 2), 
      new Vector3(max.x - min.x, max.y - min.y, max.z - min.z));
    return new Box3Helper(box, new Color(BBoxColor));
  }
}
