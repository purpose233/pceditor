import { MNOPoint } from '../tree/mnoPoint';

export class RenderPoint extends MNOPoint {
  
  private isSelected: boolean = false;
  // private isHidden: boolean = false;

  public checkIsSelected(): boolean { return this.isSelected; }

  public select() { this.isSelected = true; }

  public unselect() { this.isSelected = false; }
}
