import { ConfigProjectType } from "../common/types";

export class ProjectController {

  private projectPanel: HTMLElement = document.getElementById('project-panel') as HTMLElement;
  private projectContainer: HTMLElement = document.getElementById('project-container') as HTMLElement;
  private importBtn: HTMLButtonElement = document.getElementById('import-project-btn') as HTMLButtonElement;

  public init(): void {
    this.importBtn.addEventListener('click', () => {
      console.log('import');
    });
  }

  public showProjectPanel(): void {
    this.projectPanel.style.visibility = 'visible';
  }

  public hideProjectPanel(): void {
    this.projectPanel.style.visibility = 'hidden';
  }

  public setFromConfig(projects: ConfigProjectType[]): void {

  }

  private addProject(project: ConfigProjectType): void {
    const div = document.createElement('div');
    div.innerHTML = `
<div class="project-item" data-ref="${project.id}">
  <img src="cloud.png">
  <p class="project-info"><b>Name: </b>${project.name}</p>
  <p class="project-info"><b>Path: </b>${project.path}</p>
  <button type="button" class="btn btn-danger" data-ref="${project.id}">Delete</button>
</div>
    `
    const item = div.childNodes[0];
    this.projectContainer.appendChild(item);
  }

  private removeProject(id: string): void {
    const item = this.projectContainer.querySelector(`.project-container [data-ref="${id}"]`);
    if (item) { this.projectContainer.removeChild(item); }
  }

  private clear(): void {
    const nodes = this.projectContainer.childNodes;
    for (let i = 0; i < nodes.length; i++) {
      this.projectContainer.removeChild(nodes[i]);
    }
  }
}
