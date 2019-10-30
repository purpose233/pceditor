import { DefaultToastDelay, ToastSuccessColor, ToastErrorColor, ToastWarningColor } from '../common/constants';
import { ToastType } from '../common/types';

const $: any = (window as any).$;

export class ToastController {

  private jToastContainer: any = $('#toast-container');

  public init() {}

  public showToast(type: ToastType, title: string, info: string): void {
    const toast = $(`
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="${DefaultToastDelay}">
        <div class="toast-header">
          <div class="rounded mr-2 toast-icon" style="background: ${this.getColorByType(type)};"></div>
          <strong class="mr-auto">${title}</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="toast-body">
          ${info}
        </div>
      </div>
    `);
    this.jToastContainer.append(toast);
    toast.toast('show');
    setTimeout(() => {
      toast.remove();
    }, DefaultToastDelay + 500);
  }

  private getColorByType(type: ToastType): string {
    switch (type) {
      case 'success': return ToastSuccessColor;
      case 'warning': return ToastWarningColor;
      case 'error': return ToastErrorColor;
      case 'info': return ToastSuccessColor;
    }
  }
}