import { RenderInfoType } from '../common/types';

export class RenderController {

  private renderInfoNodes: HTMLElement = document.getElementById('renderInfoNodes') as HTMLElement;
  private renderInfoLoadedNodes: HTMLElement = document.getElementById('renderInfoLoadedNodes') as HTMLElement;
  private renderInfoPoints: HTMLElement = document.getElementById('renderInfoPoints') as HTMLElement;
  private renderInfoMaxLoD: HTMLElement = document.getElementById('renderInfoMaxLoD') as HTMLElement;
  private renderInfoSelectedPoints: HTMLElement = document.getElementById('renderInfoSelectedPoints') as HTMLElement;

  public init() {}

  public setRenderInfo(info: RenderInfoType) {
    this.renderInfoNodes.innerText = '' + info.nodes;
    this.renderInfoLoadedNodes.innerText = '' + info.loadedNodes;
    this.renderInfoPoints.innerText = '' + info.points;
    this.renderInfoMaxLoD.innerText = '' + info.maxLoD;
    this.renderInfoSelectedPoints.innerText = '' + info.selectedPoints;
  }
}