import { BaseGizmo, DragMoveEventName, DragStartEventName, DragEndEventName } from './baseGizmo';
import { Vector3 } from 'three';
import { calcClosestPointOfLines, getDirectionByAxis } from '../../common/common';
import { AxisType } from '../../common/types';

export abstract class AxisGizmo extends BaseGizmo {

  protected lastClosestPoint: Vector3 = new Vector3();

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

  protected calcClosestPoint(event: MouseEvent): Vector3 | null {
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

  protected calcDeltaOffset(closestPoint: Vector3): number | null {
    let deltaOffset: number = 0;
    switch (this.currentAxis) {
      case 'x': deltaOffset = closestPoint.x - this.lastClosestPoint.x; break;
      case 'y': deltaOffset = closestPoint.y - this.lastClosestPoint.y; break;
      case 'z': deltaOffset = closestPoint.z - this.lastClosestPoint.z; break;
    }
    return deltaOffset;
  }
}