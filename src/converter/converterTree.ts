import { BaseTree } from '../tree/baseTree';

export class ConverterTree extends BaseTree {

  private loadedCount: number = 0;

  public minusNodeCount(count: number) { this.loadedCount -= count; }

  // private serialize() {}
}