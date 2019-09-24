// import { SelectTree } from './selectTree';
// import { BaseSelector } from './baseSelector';
// import { Vector3 } from 'three';
// import { DefaultBoxSelectorWidth, DefaultBoxSelectorHeight } from '../common/constants';
// import { RenderTree } from '../render/renderTree';
// import { RenderPoint } from '../render/renderPoint';

// export class BoxSelector extends BaseSelector {

//   // TODO: add rotation
//   private center: Vector3;
//   private width: number;
//   private height: number;

//   constructor(refTree: RenderTree, center: Vector3, width: number, height: number) {
//     super(refTree);
//     this.center = center;
//     this.width = width;
//     this.height = height;
//   }

//   // public relocate(position: Vector3): void {
//   //   this.center = position;
//   // }

//   // public resize(width?: number, height?: number): void {
//   //   if (typeof width === 'number') {
//   //     this.width = width;
//   //   }
//   //   if (typeof height === 'number') {
//   //     this.height = height;
//   //   }
//   // }

//   public checkPointInSelector(point: RenderPoint): boolean {
//     return true;
//   }

//   public render(isFocused: boolean, isUpdating: boolean): void {}

//   public updateSelectTree(): void {}
// }

// export function createBoxSelectorFromPoint(point: RenderPoint, tree: RenderTree): BoxSelector {
//   return new BoxSelector(tree, point.getPosition(), DefaultBoxSelectorWidth, DefaultBoxSelectorHeight);
// }
