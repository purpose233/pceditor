export class OperationController {

  private exportConfirmBtn: HTMLButtonElement = document.getElementById('exportConfirmBtn') as HTMLButtonElement;
  private exportPathInput: HTMLInputElement = document.getElementById('exportPathInput') as HTMLInputElement;
  private exportModalCloseBtn: HTMLButtonElement = document.getElementById('exportModalCloseBtn') as HTMLButtonElement;
  private exportWaitingSpinner: HTMLElement = document.getElementById('exportWaitingSpinner') as HTMLElement;
  private returnMenuBtn: HTMLButtonElement = document.getElementById('returnMenuBtn') as HTMLButtonElement;

  private exportPath: string | null = null;
  private onExportCB: ((path: string) => Promise<void>) | null = null;
  private onReturnMenuCB: (() => Promise<void>) | null = null;

  public init(): void {
    this.returnMenuBtn.addEventListener('click', async () => {
      if (!this.onReturnMenuCB) { return; }
      await this.onReturnMenuCB();
    });
    this.exportPathInput.addEventListener('change', async () => {
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
    this.exportConfirmBtn.addEventListener('click', async () => {
      if (!this.exportPath) { return; }
      if (!this.onExportCB) {
        this.closeExportModal();
      } else {
        await this.onExportCB(this.exportPath);
      }
    });
    this.exportConfirmBtn.disabled = true;
  }

  public closeExportModal = (): void => {
    this.exportModalCloseBtn.click();
  }

  public setOnExportCB(callback: (path: string) => Promise<void>): void {
    this.onExportCB = callback;
  }

  public setOnReturnMenuCB(callback: () => Promise<void>): void {
    this.onReturnMenuCB = callback;
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
