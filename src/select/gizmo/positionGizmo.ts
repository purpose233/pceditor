import { BaseGizmo } from './baseGizmo';
import { Object3D, Mesh, Vector3, Color,  
  CylinderBufferGeometry, MeshBasicMaterial } from 'three';
import { GizmoArrowTopRadius, GizmoArrowTopHeight, GizmoArrowSegments, 
  GizmoXColor, GizmoYColor, GizmoZColor, 
  GizmoArrowBodyRadius, GizmoArrowBodyHeight } from '../../common/constants';

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
  
  constructor(position: Vector3, size: Vector3) {
    super(position, size);
  }

  protected onMouseDown(event: MouseEvent): void {
    // if () {}
  }

  protected onMouseMove(event: MouseEvent): void {

  }
  
  protected onMouseUp(event: MouseEvent): void {

  }

  protected createMeshes(size: Vector3): {x: Mesh, y: Mesh, z: Mesh} {
    const xArrow = createArrowMesh(GizmoXColor);
    xArrow.rotateZ(-Math.PI / 2);
    const yArrow = createArrowMesh(GizmoYColor);
    const zArrow = createArrowMesh(GizmoZColor);
    zArrow.rotateX(Math.PI / 2);
    return {
      x: xArrow,
      y: yArrow,
      z: zArrow
    };
  }
}
