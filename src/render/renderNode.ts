import { MNONode } from '../tree/mnoNode';
import { BoundingBoxType } from '../common/types';
import { Points, Scene, BufferGeometry, BufferAttribute, 
  PointsMaterial, VertexColors, Line, 
  Mesh, MeshBasicMaterial, Color, BoxHelper, BoxGeometry, Box3, Box3Helper, Vector3 } from 'three';
import { deserializeNode } from '../common/serialize';
import { ExportDataPath, DefaultPointSize, SelectedPointColor, BBoxColor } from '../common/constants';
import { RenderPoint } from './renderPoint';
import { MNOPoint } from '../tree/mnoPoint';

export class RenderNode extends MNONode {

  private mesh: Points | null = null;
  private bboxMesh: Line | null = null;
  private isRendering: boolean = false;
  // private isDirty: boolean = false;

  constructor(idx: string, bbox: BoundingBoxType, parentNode: null | RenderNode,
              isNew: boolean = true) {
    super(idx, bbox, parentNode, isNew);
  }

  protected createNewNode(idx: string, bbox: BoundingBoxType, parentNode: null | RenderNode): MNONode {
    return new RenderNode(idx, bbox, parentNode);
  };

  public async load(): Promise<void> {
    if (this.isLoaded) { return; }
    await deserializeNode(ExportDataPath + this.idx, this);
    this.isLoaded = true;
    this.mesh = this.createMesh();
  }

  public async unload(): Promise<void> {
    await super.unload();
    this.mesh = null;
  }

  public render(scene: Scene): void {
    if (this.isRendering) { return; }
    if (!this.isLoaded || !this.mesh) { 
      console.log('Node has not loaded!')
      return; 
    }
    scene.add(this.mesh as Points);
    this.isRendering = true;
  }

  public unrender(scene: Scene): void {
    if (!this.isRendering) { return; }
    if (!this.isLoaded || !this.mesh) { 
      console.log('Node has not loaded!')
      return; 
    }
    scene.remove(this.mesh as Points);
    this.isRendering = false;
  }

  public updateRender(scene: Scene): void {
    if (!this.isLoaded) { return; }
    if (this.isRendering) { scene.remove(this.mesh as Points); }
    this.mesh = this.createMesh();
    if (this.isRendering) { scene.add(this.mesh as Points); }
  }

  public checkIsRendering(): boolean { return this.isRendering; }

  // TODO: unrender bbox in unrender function
  public renderBBox(scene: Scene): void {
    if (!this.bboxMesh) {
      this.bboxMesh = this.createBBoxMesh();
    }
    scene.add(this.bboxMesh);
  }

  public unrenderBBox(scene: Scene): void {
    if (this.bboxMesh) {
      scene.remove(this.bboxMesh);
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
    const material = new PointsMaterial({size: DefaultPointSize, vertexColors: VertexColors});
    return new Points(geometry, material);
  }

  private createBBoxMesh(): Box3Helper {
    const bbox = this.bbox;
    const box = new Box3();
    box.setFromCenterAndSize(
      new Vector3((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2, (bbox.max.z + bbox.min.z) / 2), 
      new Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z));
    return new Box3Helper(box, new Color(BBoxColor));
  }
}
