export class OperationController {

  private exportConfirmBtn: HTMLButtonElement = document.getElementById('exportConfirmBtn') as HTMLButtonElement;
  private exportPathInput: HTMLInputElement = document.getElementById('exportPathInput') as HTMLInputElement;
  private exportModalCloseBtn: HTMLButtonElement = document.getElementById('exportModalCloseBtn') as HTMLButtonElement;
  private exportWaitingSpinner: HTMLElement = document.getElementById('exportWaitingSpinner') as HTMLElement;

  private exportPath: string | null = null;
  private exportCB: ((path: string) => void) | null = null;

  public init(): void {
    this.exportPathInput.addEventListener('change', (): void => {
      const files = this.exportPathInput.files;
      let file;
      if (files && (file = files[0])) {
        this.exportPath = file.path;
        this.exportConfirmBtn.disabled = false;
      } else {
        this.exportPath = null;
        this.exportConfirmBtn.disabled = true;
      }
    });
    this.exportConfirmBtn.addEventListener('click', (): void => {
      if (!this.exportPath) { return; }
      if (!this.exportCB) {
        this.closeExportModal();
      } else {
        this.exportCB(this.exportPath);
      }
    });
    this.exportConfirmBtn.disabled = true;
  }

  public closeExportModal = (): void => {
    this.exportModalCloseBtn.click();
  }

  public setOnConfirmExportCB(callback: (path: string) => void): void {
    this.exportCB = callback;
  }

  public disableExportModal(): void {
    this.exportPathInput.disabled = true;
    this.exportModalCloseBtn.disabled = true;
    this.exportConfirmBtn.disabled = true;
  }

  public enableExportModal(): void {
    this.exportPathInput.disabled = false;
    this.exportModalCloseBtn.disabled = false;
    this.exportConfirmBtn.disabled = !this.exportPath;
  }

  public waitExportModal(): void {
    this.exportWaitingSpinner.style.display = 'block';
    this.disableExportModal();
  }

  public unwaitExportModal(): void {
    this.exportWaitingSpinner.style.display = 'none';
    this.enableExportModal();
  }
}
