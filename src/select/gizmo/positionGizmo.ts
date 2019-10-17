import { AxisGizmo } from './axisGizmo';
import { Mesh, Vector3, Color, Scene, 
  CylinderBufferGeometry, MeshBasicMaterial } from 'three';
import { GizmoArrowTopRadius, GizmoArrowTopHeight, GizmoArrowSegments, 
  GizmoXColor, GizmoYColor, GizmoZColor, 
  GizmoArrowBodyRadius, GizmoArrowBodyHeight, GizmoXHighlightColor, GizmoYHighlightColor, GizmoZHighlightColor } from '../../common/constants';
import { GizmoMeshesType } from '../../common/types';

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
