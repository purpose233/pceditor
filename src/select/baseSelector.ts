import { SelectTree } from './selectTree';
import { RenderTree } from '../render/renderTree';
import { RenderNode } from '../render/renderNode';
import { RenderPoint } from '../render/renderPoint';
import { Scene } from 'three';
import { SelectNode } from './selectNode';
import { MNOPoint } from '../tree/mnoPoint';

export abstract class BaseSelector {

  // TODO: fix the poor design of scene attribute
  // used in gizmo callback, cuz it is called by emitter
  protected scene: Scene;
  protected refTree: RenderTree;
  protected selectTree: SelectTree;
  protected isRendering: boolean = false;
  // whether the selector is updated
  protected isUpdated: boolean = false;
 
  constructor(refTree: RenderTree, scene: Scene) {
    this.refTree = refTree;   
    this.scene = scene;
    this.selectTree = new SelectTree(refTree);
  }

  public abstract checkNodeInSelector(node: RenderNode): boolean;
  
  public abstract checkPointInSelector(point: RenderPoint): boolean;

  public abstract render(scene: Scene): void;

  public abstract unrender(scene: Scene): void;

  public checkIsRendering(): boolean { return this.isRendering; }
  
  public getPointCount(): number {
    return (this.selectTree.getRootNode() as SelectNode).getSubtreePointCount();
  }

  public markUnloadedNodes(nodes: RenderNode[]): void {
    for (const node of nodes) {
      const idx = node.getIdx();
      const selectNode = this.selectTree.getNodeByIdx(idx);
      if (selectNode) { (selectNode as SelectNode).setNeedReconnect(); }
    }
  }

  public async deletePoints(scene: Scene): Promise<void> {
    const rootNode = this.selectTree.getRootNode() as SelectNode;
    await this.deleteRecursively(rootNode, rootNode.getRefNode());
    this.selectTree.updateTreeRender(scene);
    this.selectTree = new SelectTree(this.refTree);
    this.updateSelectTree(scene);
  }

  // only used when the selector is no more needed
  public clearPoints(scene: Scene): void {
    const rootNode = this.selectTree.getRootNode() as SelectNode;
    rootNode.clear(true);
    this.selectTree.updateTreeRender(scene);
    this.unrender(scene);
  }

  public rebuildConnection(selectNode: SelectNode, refNode: RenderNode): void {
    // const selectNode = this.selectTree.getNodeByIdx(refNode.getIdx()) as SelectNode | null;
    // if (!selectNode) { return; }
    const iter = selectNode.getGridEntryIter();
    let result;
    while (!(result = iter.next()).done) {
      const gNumber: number = result.value[0];
      selectNode.selectGridPoint(refNode.getGridPoint(gNumber) as RenderPoint, gNumber);
    }

    this.diffStacks(selectNode, refNode);
    selectNode.setDirty();
  }

  // The function updateSelectTree will update each node of select tree and should be 
  //  called after selector is changed.
  public updateSelectTree(scene: Scene): void {
    this.selectTree.dirtyTree();
    this.selectTree.unreachTree();
    const refNode = this.refTree.getRootNode() as RenderNode;
    const selectNode = this.selectTree.getRootNode() as SelectNode;
    if (!this.checkNodeInSelector(refNode)) {
      selectNode.clear();
    } else {
      this.updateTreeRecursively(selectNode, refNode);
    }
    // Update rendering before removing unreached nodes so that the unreached node 
    //  which contains points before updating could be cleared.
    this.selectTree.updateTreeRender(scene);
    this.selectTree.removeUnreachedNodes();
  };

  // The function completeSelectTree won't change the node that already has selecting result, 
  //  but will check the previous unloaded node.
  // It should be called after lru operation is excuted.
  public completeSelectTree(scene: Scene): void {
    const refNode = this.refTree.getRootNode() as RenderNode;
    const selectNode = this.selectTree.getRootNode() as SelectNode;
    this.completeTreeRecursively(selectNode, refNode);
    this.selectTree.updateTreeRender(scene);
  }

  private diffGrid(selectNode: SelectNode, refNode: RenderNode): void {
    let isDirty = false;
    
    if (selectNode.getGridCount() === 0) {
      refNode.travelGrid((p: MNOPoint, i: number, gridNumber: number): void => {
        const point = p as RenderPoint;
        if (this.checkPointInSelector(point)) {
          isDirty = true;
          selectNode.selectGridPoint(point, gridNumber);
        }
      });
    } else {
      const refPoints = refNode.getGridPointsByOrder() as [number, RenderPoint][];
      const selectPoints = selectNode.getGridPointsByOrder();
      const addNumbers: number[] = [];
      const removeNumbers: number[] = [];
      let selectIndex = 0, refIndex = 0;
      let selectNumber: number = selectPoints[selectIndex][0];
      while (refIndex < refPoints.length) {
        const refNumber = refPoints[refIndex][0], refPoint = refPoints[refIndex][1];
        refIndex++;
        if (!this.checkPointInSelector(refPoint as RenderPoint)) { continue; }
        if (selectNumber === -1) {
          isDirty = true;
          addNumbers.push(refNumber);
        } else {
          if (refNumber < selectNumber) {
            isDirty = true;
            addNumbers.push(refNumber);
          } else if (refNumber === selectNumber) {
            selectIndex++;
            selectNumber = selectIndex >= selectPoints.length ? -1 : selectPoints[selectIndex][0];
          } else {
            isDirty = true;
            removeNumbers.push(selectNumber); 
            while (true) {
              selectIndex++;
              if (selectIndex >= selectPoints.length) {
                selectNumber = -1;
                break;
              } else {
                selectNumber = selectPoints[selectIndex][0];
                if (selectNumber < refNumber) {
                  removeNumbers.push(selectNumber);
                } else if (selectNumber === refNumber) {
                  selectIndex++;
                  selectNumber = selectIndex >= selectPoints.length ? -1 : selectPoints[selectIndex][0];
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
        removeNumbers.push(selectNumber);
        selectIndex++; 
        while (selectIndex < selectPoints.length) {
          selectNumber = selectPoints[selectIndex][0];
          removeNumbers.push(selectNumber);
          selectIndex++
        }
      }
      for (const gridNumber of removeNumbers) {
        selectNode.unselectGridPoint(gridNumber);
      }
      for (const gridNumber of addNumbers) {
        selectNode.selectGridPoint(refNode.getGridPoint(gridNumber) as RenderPoint, gridNumber);
      }
    }
    
    if (isDirty) { selectNode.setDirty(); }
  }

  private diffStacks(selectNode: SelectNode, refNode: RenderNode): void {
    let isDirty = false;

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

    if (isDirty) { selectNode.setDirty(); }
  }

  private diff(selectNode: SelectNode, refNode: RenderNode): void {
    this.diffGrid(selectNode, refNode);
    this.diffStacks(selectNode, refNode);
  }

  private async deleteRecursively(selectNode: SelectNode, refNode: RenderNode): Promise<void> {
    // TODO: fill the hole of deletion
    let needUnload = false;
    if (!refNode.checkIsLoaded()) {
      // need not to create mesh for loaded refNode
      await refNode.load(true);
      needUnload = true;
    }
    if (selectNode.checkNeedReconnect()) {
      this.rebuildConnection(selectNode, refNode);
      selectNode.setNotNeedReconnect();
    }
    if (selectNode.checkNeedDiff()) {
      this.diff(selectNode, refNode);
      selectNode.setNotNeedDiff();
    }
    selectNode.delete();
    selectNode.setDirty();
    // do not clear the nodes in subtree
    selectNode.clear(false);
    if (needUnload) {
      await refNode.unload();
    }
    for (const childNode of selectNode.getChildNodes() as SelectNode[]) {
      await this.deleteRecursively(childNode, childNode.getRefNode());
    }
  }

  private updateTreeRecursively(selectNode: SelectNode, refNode: RenderNode): void {
    if (refNode.checkIsLoaded()) {
      this.diff(selectNode, refNode);
      selectNode.setNotNeedDiff();
    } else {
      selectNode.setNeedDiff();
    }
    selectNode.setReached();

    // check points in child nodes
    for (const entry of refNode.getChildNodesWithNumber()) {
      const childNumber = entry[0], childRefNode = entry[1] as RenderNode;
      if (this.checkNodeInSelector(childRefNode)) {
        if (!selectNode.checkChildNodeExist(childNumber)) {
          selectNode.setChildNode(childNumber, 
            new SelectNode(selectNode.getIdx() + childNumber, selectNode, childRefNode));
        }
        this.updateTreeRecursively(selectNode.getChildNode(childNumber) as SelectNode, childRefNode);
      } else if (selectNode.checkChildNodeExist(childNumber)) {
        (selectNode.getChildNode(childNumber) as SelectNode).clear();
      }
    }
  }

  private completeTreeRecursively(selectNode: SelectNode, refNode: RenderNode): void {
    if (refNode.checkIsLoaded()) {
      if (selectNode.checkNeedReconnect()) {
        this.rebuildConnection(selectNode, refNode);
        selectNode.setNotNeedReconnect();
      }
      if (selectNode.checkNeedDiff()) {
        this.diff(selectNode, refNode);
        selectNode.setNotNeedDiff();
      }
    }

    for (const childWithNumber of selectNode.getChildNodesWithNumber()) {
      this.completeTreeRecursively(childWithNumber[1] as SelectNode, 
                                   refNode.getChildNode(childWithNumber[0]) as RenderNode);
    }
  }
}
