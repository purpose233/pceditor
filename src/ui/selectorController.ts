import { SelectorNameType } from '../common/types';

export class SelectorController {
  
  private noneSelectorBtn: HTMLElement = document.getElementById('noneSelector') as HTMLElement;
  private boxSelectorBtn: HTMLElement = document.getElementById('boxSelector') as HTMLElement;
  private sphereSelectorBtn: HTMLElement = document.getElementById('sphereSelector') as HTMLElement;
  
  private currentBtn: HTMLElement = this.noneSelectorBtn;
  private onSelectorChangeCB: ((selectorName: SelectorNameType, lastSelectorName: SelectorNameType) => Promise<void>) | null = null;

  public init() {
    this.noneSelectorBtn.addEventListener('click', async () => {
      if (this.currentBtn === this.noneSelectorBtn) { return; }
      else { await this.onSelectorBtnClick(this.noneSelectorBtn); }
    });
    this.boxSelectorBtn.addEventListener('click', async () => {
      if (this.currentBtn === this.boxSelectorBtn) { return; }
      else { await this.onSelectorBtnClick(this.boxSelectorBtn); }
    });
    this.sphereSelectorBtn.addEventListener('click', async () => {
      if (this.currentBtn === this.sphereSelectorBtn) { return; }
      else { await this.onSelectorBtnClick(this.sphereSelectorBtn); }
    });
  }

  public setOnSelectorChangeCB(callback: (selectorName: SelectorNameType, lastSelectorName: SelectorNameType) => Promise<void>) {
    this.onSelectorChangeCB = callback;
  }

  private onSelectorBtnClick = async (btn: HTMLElement) => {
    const lastSelectorName = this.getSelectorNameByBtn(this.currentBtn);
    this.unselectBtn(this.currentBtn);
    this.selectBtn(btn);
    this.currentBtn = btn;
    const selectorName = this.getSelectorNameByBtn(btn);
    if (this.onSelectorChangeCB) {
      await this.onSelectorChangeCB(selectorName, lastSelectorName);
    }
  }

  private getSelectorNameByBtn(btn: HTMLElement): SelectorNameType {
    switch (btn) {
      case this.boxSelectorBtn: return 'boxSelector';
      case this.sphereSelectorBtn: return 'sphereSelector';
      case this.noneSelectorBtn: 
      default: return null;
    }
  }

  private selectBtn(btn: HTMLElement) {
    btn.classList.add('btn-light');
    btn.classList.remove('btn-secondary');
  }

  private unselectBtn(btn: HTMLElement) {
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-light');
  }
}
