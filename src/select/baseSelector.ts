import { SelectTree } from './selectTree';
import { RenderTree } from '../render/renderTree';
import { RenderNode } from '../render/renderNode';
import { RenderPoint } from '../render/renderPoint';
import { Scene } from 'three';

export abstract class BaseSelector {
  
  private refTree: RenderTree;
  private selectTree: SelectTree;
  private isUpdated: boolean = false;

  constructor(refTree: RenderTree) {
    this.refTree = refTree;   
    this.selectTree = new SelectTree(refTree);
  }
  
  public abstract select(scene: Scene): void;

  public abstract unselected(scene: Scene): void;

  public abstract checkNodeInSelector(node: RenderNode): boolean;
  
  public abstract checkPointInSelector(point: RenderPoint): boolean;

  // public abstract render(isFocused: boolean, isUpdating: boolean): void; 

  public abstract updateSelectTree(): void;
}
