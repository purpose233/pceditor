import { MNOPoint } from '../tree/mnoPoint';

export class RenderPoint extends MNOPoint {
  
  private isSelected: boolean = false;
  // private isDeleted: boolean = false;

  public checkIsSelected(): boolean { return this.isSelected; }

  // public checkIsDeleted(): boolean { return this.isDeleted; }

  public select() { this.isSelected = true; }

  public unselect() { this.isSelected = false; }

  // public delete() { this.isDeleted = true; }

  // public undelete() { this.isDeleted = false; }
}
