import { AxisGizmo } from './axisGizmo';
import { Mesh, Vector3, Color, Scene, 
  CylinderBufferGeometry, MeshBasicMaterial, BackSide } from 'three';
import { GizmoArrowTopRadius, GizmoArrowTopHeight, GizmoArrowSegments, 
  GizmoXColor, GizmoYColor, GizmoZColor, 
  GizmoArrowBodyRadius, GizmoArrowBodyHeight, GizmoXHighlightColor, GizmoYHighlightColor, GizmoZHighlightColor, OutlineColor, OutlineRatio } from '../../common/constants';
import { GizmoMeshesType } from '../../common/types';

// default cylinder is placed at origin and orient to y+ direction
function createArrowMesh(color: Color): Mesh {
  const material = new MeshBasicMaterial({color});
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
  
  // create outline mesh
  const outlineMaterial = new MeshBasicMaterial({color: OutlineColor, side: BackSide});
  const topGeometryOutline = new CylinderBufferGeometry(0, GizmoArrowTopRadius * OutlineRatio, 
    GizmoArrowTopHeight * OutlineRatio, GizmoArrowSegments);
  const arrowTopOutline = new Mesh(topGeometryOutline, outlineMaterial);
  const ratio = (OutlineRatio - 1) * 2.5 + 1;
  const bodyGeometryOutline = new CylinderBufferGeometry(GizmoArrowBodyRadius * ratio, GizmoArrowBodyRadius * ratio, 
    GizmoArrowBodyHeight, GizmoArrowSegments);
  const arrowBodyOutline = new Mesh(bodyGeometryOutline, outlineMaterial);
  arrowTopOutline.translateY(GizmoArrowBodyHeight / 2 + GizmoArrowTopHeight * OutlineRatio / 2);
  arrowBody.add(arrowTopOutline);
  arrowBody.add(arrowBodyOutline);
  return arrowBody;
}

export class PositionGizmo extends AxisGizmo {

  public relocate(scene: Scene, position: Vector3): void {
    this.position.set(position.x, position.y, position.z);
    this.xMesh.position.set(position.x, position.y, position.z);
    this.yMesh.position.set(position.x, position.y, position.z);
    this.zMesh.position.set(position.x, position.y, position.z);
    this.xHighlightMesh.position.set(position.x, position.y, position.z);
    this.yHighlightMesh.position.set(position.x, position.y, position.z);
    this.zHighlightMesh.position.set(position.x, position.y, position.z);
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
}
