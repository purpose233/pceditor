import { ConfigProjectType } from "../common/types";

declare const $: any;

export class ProjectController {

  private projectPanel: HTMLElement = document.getElementById('project-panel') as HTMLElement;
  private projectContainer: HTMLElement = document.getElementById('project-container') as HTMLElement;
  private importBtn: HTMLButtonElement = document.getElementById('import-project-btn') as HTMLButtonElement;
  private importNameInput: HTMLInputElement = document.getElementById('import-name-input') as HTMLInputElement;
  private importFileInput: HTMLInputElement = document.getElementById('import-project-input') as HTMLInputElement;
  private importConfirmBtn: HTMLButtonElement = document.getElementById('import-confirm-btn') as HTMLButtonElement;

  private onUploadCB: ((file: File | null, name: string | null) => Promise<void>) | null = null;

  public init(): void {
    this.importBtn.addEventListener('click', () => {
      this.openUploadModal();
    });
    this.importConfirmBtn.addEventListener('click', async () => {
      if (!this.onUploadCB) { return; }
      const name = this.importNameInput.value === '' ? null : this.importNameInput.value;
      const file = this.importFileInput.files && this.importFileInput.files[0] 
                   ? this.importFileInput.files[0] : null;
      this.onUploadCB(file, name);
    });
    this.projectContainer.addEventListener('click', (e) => {
      
    });
  }

  public setOnUploadCB(callback: (file: File | null, name: string | null) => Promise<void>) {
    this.onUploadCB = callback;
  }

  public showProjectPanel(): void {
    this.projectPanel.style.visibility = 'visible';
  }

  public hideProjectPanel(): void {
    this.projectPanel.style.visibility = 'hidden';
  }

  public setFromConfig(projects: ConfigProjectType[]): void {
    this.clear();
    for (const project of projects) {
      this.addProject(project);
    }
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
    `;
    const item = div.childNodes[0];
    this.projectContainer.appendChild(item);
  }

  private openUploadModal(): void {
    this.importNameInput.value = '';
    this.importFileInput.value = '';
    $('#import-project-modal').modal('show');
  }

  // private closeUploadModal(): void {
  //   $('#import-project-modal').modal('hide');
  //   this.importInput.value = '';
  // }

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
