import { ConfigProjectType } from "../common/types";

declare const $: any;

export class ProjectController {

  private waitingMask: HTMLElement = document.getElementById('mask-container') as HTMLElement;
  private projectPanel: HTMLElement = document.getElementById('project-mask') as HTMLElement;
  private projectContainer: HTMLElement = document.getElementById('project-container') as HTMLElement;
  private importBtn: HTMLButtonElement = document.getElementById('import-project-btn') as HTMLButtonElement;
  private importNameInput: HTMLInputElement = document.getElementById('import-name-input') as HTMLInputElement;
  private importFileInput: HTMLInputElement = document.getElementById('import-project-input') as HTMLInputElement;
  private importConfirmBtn: HTMLButtonElement = document.getElementById('import-confirm-btn') as HTMLButtonElement;
  private deleteConfirmBtn: HTMLButtonElement = document.getElementById('confirm-delete-btn') as HTMLButtonElement;

  // The return value of callback control whether to close the modal.
  private onUploadCB: ((file: File | null, name: string | null) => Promise<boolean>) | null = null;
  private onDeleteCB: ((id: string) => Promise<boolean>) | null = null;
  private onEditCB: ((id: string) => Promise<boolean>) | null = null;

  private currentDeleteId: string | null = null;
  
  public init(): void {
    this.importBtn.addEventListener('click', () => {
      this.openUploadModal();
    });
    this.importConfirmBtn.addEventListener('click', async () => {
      if (!this.onUploadCB) { return; }
      this.showMask();
      const name = this.importNameInput.value === '' ? null : this.importNameInput.value;
      const file = this.importFileInput.files && this.importFileInput.files[0] 
                   ? this.importFileInput.files[0] : null;
      // await new Promise((resolve) => {
      //   setTimeout(() => {resolve()}, 2000)
      // })
      if (await this.onUploadCB(file, name)) {
        this.closeUploadModal();
      }
      this.hideMask();
    });
    this.projectContainer.addEventListener('click', async (e: MouseEvent) => {
      if (this.onDeleteCB && this.onEditCB
        && e.target && (e.target as Element).tagName === 'BUTTON' 
        && (e.target as Element).getAttribute('data-ref') !== null) {
        const id = (e.target as Element).getAttribute('data-ref') as string;
        if ((e.target as Element).getAttribute('data-type') === 'delete') {
          this.currentDeleteId = id;
          this.openDeleteModal();
        } else {
          if (await this.onEditCB(id)) {
            this.hideProjectPanel();
          }
        }
      }
    });
    this.deleteConfirmBtn.addEventListener('click', async () => {
      if (this.currentDeleteId && this.onDeleteCB) { 
        if (await this.onDeleteCB(this.currentDeleteId)) {
          this.closeDeleteModal();
        }
      } else {
        this.closeDeleteModal(); 
      }
    });
  }

  public setOnUploadCB(callback: (file: File | null, name: string | null) => Promise<boolean>) {
    this.onUploadCB = callback;
  }

  public setOnDeleteCB(callback: (id: string) => Promise<boolean>): void {
    this.onDeleteCB = callback;
  }

  public setOnEditCB(callback: (id: string) => Promise<boolean>): void {
    this.onEditCB = callback;
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

  public addProject(project: ConfigProjectType): void {
    const div = document.createElement('div');
    div.innerHTML = `
<div class="project-item" data-ref="${project.id}">
  <img src="cloud.png">
  <p class="project-info"><b>Name: </b>${project.name}</p>
  <p class="project-info"><b>Path: </b>${project.path}</p>
  <button type="button" class="btn btn-primary" data-ref="${project.id}" data-type="edit">Edit</button>
  <button type="button" class="btn btn-danger" data-ref="${project.id}" data-type="delete">Delete</button>
</div>
    `;
    const item = div.childNodes[1];
    this.projectContainer.appendChild(item);
  }

  public deleteProject(id: string): void {
    const childNodes = this.projectContainer.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === 1 
        && (node as Element).classList.contains('project-item')
        && (node as Element).getAttribute('data-ref') === id) {
        this.projectContainer.removeChild(node);
      }
    }
  }

  private openUploadModal(): void {
    this.importNameInput.value = '';
    this.importFileInput.value = '';
    $('#import-project-modal').modal('show');
  }
  
  private closeUploadModal(): void {
    $('#import-project-modal').modal('hide');
  }

  private openDeleteModal(): void {
    $('#confirm-delete-modal').modal('show');
  }
  
  private closeDeleteModal(): void {
    $('#confirm-delete-modal').modal('hide');
  }

  private showMask(): void {
    this.waitingMask.style.display = 'block';
  }

  private hideMask(): void {
    this.waitingMask.style.display = 'none';
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
