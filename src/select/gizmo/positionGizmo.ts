import { BaseGizmo, DragMoveEventName, DragStartEventName, DragEndEventName } from './baseGizmo';
import { Object3D, Mesh, Vector3, Color,  
  CylinderBufferGeometry, MeshBasicMaterial, Vector2, Raycaster, Camera, Scene } from 'three';
import { GizmoArrowTopRadius, GizmoArrowTopHeight, GizmoArrowSegments, 
  GizmoXColor, GizmoYColor, GizmoZColor, 
  GizmoArrowBodyRadius, GizmoArrowBodyHeight, GizmoXHighlightColor, GizmoYHighlightColor, GizmoZHighlightColor } from '../../common/constants';
import { calcClosestPointOfLines, getDirectionByAxis } from '../../common/common';
import { AxisType, GizmoMeshesType } from '../../common/types';

// default cylinder is placed at origin and orient to y+ direction
function createArrowMesh(color: Color): Mesh {
  const material = new MeshBasicMaterial({color})
  const topGeometry = new CylinderBufferGeometry(0, GizmoArrowTopRadius, 
                                                 GizmoArrowTopHeight, GizmoArrowSegments);
  const arrowTop = new Mesh(topGeometry, material);
  const bodyGeometry = new CylinderBufferGeometry(GizmoArrowBodyRadius, GizmoArrowBodyRadius, 
                                          GizmoArrowBodyHeight, GizmoArrowSegments);
  const arrowBody = new Mesh(bodyGeometry, material);
  // arrowBody.translateY(GizmoArrowBodyHeight / 2);
  // cuz the arrow top is a child of arrow body, the translating result will be the sum of two mesh.
  arrowTop.translateY(GizmoArrowBodyHeight / 2 + GizmoArrowTopHeight / 2);
  arrowBody.add(arrowTop);
  return arrowBody;
}

export class PositionGizmo extends BaseGizmo {

  private rayCaster: Raycaster = new Raycaster();
  private lastClosestPoint: Vector3 = new Vector3();

  constructor(scene: Scene, camera: Camera, position: Vector3, size: Vector3) {
    super(scene, camera, position, size);
  }

  protected onMouseDown(event: MouseEvent): void {
    const selected = this.intersectObject(event);

    // Used for testing intersecting
    // var geometry = new THREE.Geometry();
    // geometry.vertices.push(this.camera.position.clone());
    // geometry.vertices.push(this.camera.position.clone().add(this.rayCaster.ray.direction.multiplyScalar(10)));
    // var material = new THREE.LineBasicMaterial( { color: 0xffffff } );
    // var line = new THREE.Line( geometry, material );
    // this.scene.add( line );

    if (selected) {
      this.currentAxis = this.determineAxis(selected);
      if (!this.currentAxis) { return; }
      const result = calcClosestPointOfLines(this.position, 
        getDirectionByAxis(this.currentAxis as AxisType), 
        this.rayCaster.ray.origin, this.rayCaster.ray.direction);
      if (!result) {
        // TODO: handle when calculation is failed
      } else {
        this.lastClosestPoint = result.point0;
      }
      this.highlight(this.scene, this.currentAxis);
      this.totalOffset = 0;
      this.emitter.emit(DragStartEventName, this.currentAxis);
      event.stopPropagation();
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    if (!this.currentAxis) {
      const selected = this.intersectObject(event);
      if (selected) {
        this.highlight(this.scene, this.determineAxis(selected) as AxisType);
      } else {
        this.unhighlight(this.scene);
      }
    } else {
      const closestPoint = this.calcClosestPoint(event);
      if (!closestPoint) { return; }
      const deltaOffset = this.calcDeltaOffset(closestPoint);
      this.lastClosestPoint = closestPoint;
      if (deltaOffset) {
        this.totalOffset += deltaOffset;
        this.emitter.emit(DragMoveEventName, this.currentAxis, deltaOffset, this.totalOffset);
      }
      event.stopPropagation();
    }
  }
  
  protected onMouseUp(event: MouseEvent): void {
    if (!this.currentAxis) { return; }
    const closestPoint = this.calcClosestPoint(event);
    const deltaOffset = closestPoint ? this.calcDeltaOffset(closestPoint) : 0;
    if (deltaOffset) {
      this.totalOffset += deltaOffset;
      this.emitter.emit(DragEndEventName, this.currentAxis, deltaOffset, this.totalOffset);
    }
    this.currentAxis = null;
    this.unhighlight(this.scene);
    event.stopPropagation();
  }

  protected createMeshes(size: Vector3): GizmoMeshesType {
    const xArrow = createArrowMesh(GizmoXColor);
    xArrow.rotateZ(-Math.PI / 2);
    const yArrow = createArrowMesh(GizmoYColor);
    const zArrow = createArrowMesh(GizmoZColor);
    zArrow.rotateX(Math.PI / 2);
    const xHArrow = createArrowMesh(GizmoXHighlightColor);
    xHArrow.rotateZ(-Math.PI / 2);
    const yHArrow = createArrowMesh(GizmoYHighlightColor);
    const zHArrow = createArrowMesh(GizmoZHighlightColor);
    zHArrow.rotateX(Math.PI / 2);
    return {
      x: xArrow, y: yArrow, z: zArrow,
      xh: xHArrow, yh: yHArrow, zh: zHArrow
    };
  }

  private calcClosestPoint(event: MouseEvent): Vector3 | null {
    const mouse = this.calcMouse(event);
    this.rayCaster.setFromCamera(mouse, this.camera);
    const result = calcClosestPointOfLines(this.position, 
      getDirectionByAxis(this.currentAxis as AxisType), 
      this.rayCaster.ray.origin, this.rayCaster.ray.direction);
    if (!result) {
      // TODO:
      return null;
    } else {
      return result.point0;
    }
  }

  private calcDeltaOffset(closestPoint: Vector3): number | null {
    let deltaOffset: number = 0;
    switch (this.currentAxis) {
      case 'x': deltaOffset = closestPoint.x - this.lastClosestPoint.x; break;
      case 'y': deltaOffset = closestPoint.y - this.lastClosestPoint.y; break;
      case 'z': deltaOffset = closestPoint.z - this.lastClosestPoint.z; break;
    }
    return deltaOffset;
  }

  private intersectObject(event: MouseEvent): Object3D | null {
    const mouse = this.calcMouse(event);
    this.rayCaster.setFromCamera(mouse, this.camera);
    const intersects = this.rayCaster.intersectObjects(this.getMeshes(), true);
    if (intersects.length > 0) { return intersects[0].object }
    else { return null; }
  }
}
