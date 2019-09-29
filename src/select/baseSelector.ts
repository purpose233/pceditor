import { SelectTree } from './selectTree';
import { RenderTree } from '../render/renderTree';
import { RenderNode } from '../render/renderNode';
import { RenderPoint } from '../render/renderPoint';
import { Scene } from 'three';
import { SelectNode } from './selectNode';
import { MNOPoint } from '../tree/mnoPoint';

export abstract class BaseSelector {
  
  protected refTree: RenderTree;
  protected selectTree: SelectTree;
  protected isRendering: boolean = false;
  protected isUpdated: boolean = false;

  constructor(refTree: RenderTree) {
    this.refTree = refTree;   
    this.selectTree = new SelectTree(refTree);
  }
  
  public abstract select(scene: Scene): void;

  public abstract unselected(scene: Scene): void;

  public abstract checkNodeInSelector(node: RenderNode): boolean;
  
  public abstract checkPointInSelector(point: RenderPoint): boolean;

  public render(scene: Scene, isFocused: boolean): void {
    this.isRendering = true;
  } 

  // public abstract pick();

  public checkIsRendering(): boolean { return this.isRendering; }

  public updateSelectTree(scene: Scene): void {
    this.selectTree.dirtyTree();
    this.selectTree.unreachTree();
    const refNode = this.refTree.getRootNode() as RenderNode;
    const selectNode = this.selectTree.getRootNode() as SelectNode;
    if (!this.checkNodeInSelector(refNode)) {
      selectNode.clear();
    } else {
      this.selectTreeRecursively(selectNode, refNode);
    }
    // Update rendering before remove unreached nodes.
    this.selectTree.updateTreeRender(scene);
    this.selectTree.removeUnreachedNodes();
  };

  private selectTreeRecursively(selectNode: SelectNode, refNode: RenderNode): void {
    let isDirty = false;
    
    // check points in grid
    const addNumbers: number[] = [];
    const removeNumbers: number[] = [];
    const refIter = refNode.getGridEntryIter();
    const selectIter = selectNode.getGridEntryIter();
    let refResult, selectResult = selectIter.next();
    if (selectResult.done) {
      refNode.travelGrid((p: MNOPoint, i: number, gridNumber: number): void => {
        const point = p as RenderPoint;
        if (this.checkPointInSelector(point)) {
          isDirty = true;
          selectNode.selectGridPoint(point, gridNumber);
        }
      });
    } else {
      let selectNumber = selectResult.value[0];
      while (!(refResult = refIter.next()).done) {
        const refNumber = refResult.value[0], refPoint = refResult.value[1];
        if (!this.checkPointInSelector(refPoint as RenderPoint)) { continue; }
        if (selectNumber === -1) {
          isDirty = true;
          addNumbers.push(refNumber);
        } else {
          if (refNumber < selectNumber) {
            isDirty = true;
            addNumbers.push(refNumber);
          } else if (refNumber === selectNumber) {
            selectResult = selectIter.next();
            selectNumber = selectResult.done ? -1 : selectResult.value[0];
          } else {
            isDirty = true;
            removeNumbers.push(selectNumber); 
            while (true) {
              selectResult = selectIter.next();
              if (selectResult.done) {
                selectNumber = -1;
                break;
              } else {
                selectNumber = selectResult.value[0];
                if (selectNumber < refNumber) {
                  removeNumbers.push(selectNumber);
                } else if (selectNumber === refNumber) {
                  selectResult = selectIter.next();
                  selectNumber = selectResult.done ? -1 : selectResult.value[0];
                  break;
                } else {
                  addNumbers.push(refNumber);
                  break;
                }
              }
            }
          }
        }
      }
      if (selectNumber !== -1) {
        isDirty = true;
        while (!(selectResult = selectIter.next()).done) {
          selectNumber = selectResult.value[0];
          removeNumbers.push(selectNumber);
        }
      }
      for (const gridNumber of removeNumbers) {
        selectNode.unselectGridPoint(gridNumber);
      }
      for (const gridNumber of addNumbers) {
        selectNode.selectGridPoint(refNode.getGridPoint(gridNumber) as RenderPoint, gridNumber);
      }
    }

    // check points in stacks
    // TODO: there are much to do to improve the comparing performance
    const refStackPoints: RenderPoint[][] = [[],[],[],[],[],[],[],[]];
    const selectStacks = selectNode.getStacks();
    refNode.travelStacks((p: MNOPoint, i: number, stackNumber: number): void => {
      const point = p as RenderPoint;
      if (this.checkPointInSelector(point)) {
        refStackPoints[stackNumber].push(point);
      }
    });
    for (let i = 0; i < 8; i++) {
      for (const point of refStackPoints[i]) {
        if (!selectStacks[i].includes(point)) {
          selectNode.selectStackPoint(point, i);
        }
      }
      for (const point of selectStacks[i]) {
        if (!refStackPoints[i].includes(point)) {
          selectNode.unselectStackPoint(point, i);
        }
      }
    }

    isDirty ? selectNode.setDirty() : selectNode.setClean();
    selectNode.setReached();

    // check points in child nodes
    for (const entry of refNode.getChildNodesWithNumber()) {
      const childNumber = entry[0], childRefNode = entry[1] as RenderNode;
      if (this.checkNodeInSelector(childRefNode)) {
        if (!selectNode.checkChildNodeExist(childNumber)) {
          selectNode.setChildNode(childNumber, 
            new SelectNode(selectNode.getIdx() + childNumber, selectNode, refNode));
        }
        this.selectTreeRecursively(selectNode.getChildNode(childNumber) as SelectNode, childRefNode);
      } else if (selectNode.checkChildNodeExist(childNumber)) {
        (selectNode.getChildNode(childNumber) as SelectNode).clear();
      }
    }
  }
}
