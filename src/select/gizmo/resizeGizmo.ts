import { AxisGizmo } from './axisGizmo';
import { Vector3, Scene, MeshBasicMaterial, 
  SphereBufferGeometry, Color, Mesh, BackSide, FrontSide } from 'three';
import { GizmoMeshesType } from '../../common/types';
import { GizmoSphereRadius, GizmoSphereSegments, 
  GizmoXColor, GizmoYColor, GizmoZColor, 
  GizmoXHighlightColor, GizmoYHighlightColor, GizmoZHighlightColor, OutlineColor, OutlineRatio } from '../../common/constants';

function createSphere(color: Color): Mesh {
  const material = new MeshBasicMaterial({color, side: FrontSide});
  const geometry = new SphereBufferGeometry(GizmoSphereRadius, 
    GizmoSphereSegments, GizmoSphereSegments);
  const mesh = new Mesh(geometry, material);
  
  // create outline mesh
  const outlineMaterial = new MeshBasicMaterial({color: OutlineColor, side: BackSide});
  const outlineMesh = new Mesh(geometry, outlineMaterial);
  outlineMesh.scale.multiplyScalar(OutlineRatio);
  mesh.add(outlineMesh);
  return mesh;
}

export class SizeGizmo extends AxisGizmo {

  public relocate(scene: Scene, position: Vector3): void {
    this.position.set(position.x, position.y, position.z);
    this.xMesh.position.set(position.x + this.size.x, position.y, position.z);
    this.yMesh.position.set(position.x, position.y + this.size.y, position.z);
    this.zMesh.position.set(position.x, position.y, position.z + this.size.z);
    this.xHighlightMesh.position.set(position.x + this.size.x, position.y, position.z);
    this.yHighlightMesh.position.set(position.x, position.y + this.size.y, position.z);
    this.zHighlightMesh.position.set(position.x, position.y, position.z + this.size.z);
  }

  protected createMeshes(size: Vector3): GizmoMeshesType {
    const x = createSphere(GizmoXColor);
    const y = createSphere(GizmoYColor);
    const z = createSphere(GizmoZColor);
    const xh = createSphere(GizmoXHighlightColor);
    const yh = createSphere(GizmoYHighlightColor);
    const zh = createSphere(GizmoZHighlightColor);
    return { x, y, z, xh, yh, zh };
  }
}
