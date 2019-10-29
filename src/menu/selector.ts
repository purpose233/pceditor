import { SelectorNameType } from '../common/types';

export class SelectorController {
  
  private noneSelectorBtn: HTMLElement = document.getElementById('noneSelector') as HTMLElement;
  private boxSelectorBtn: HTMLElement = document.getElementById('boxSelector') as HTMLElement;
  private sphereSelectorBtn: HTMLElement = document.getElementById('sphereSelector') as HTMLElement;
  
  private currentBtn: HTMLElement = this.noneSelectorBtn;
  private selectorChangeCB: ((selectorName: SelectorNameType, lastSelectorName: SelectorNameType) => void) | null = null;

  public init() {
    this.noneSelectorBtn.addEventListener('click', () => {
      if (this.currentBtn === this.noneSelectorBtn) { return; }
      else { this.onSelectorBtnClick(this.noneSelectorBtn); }
    });
    this.boxSelectorBtn.addEventListener('click', () => {
      if (this.currentBtn === this.boxSelectorBtn) { return; }
      else { this.onSelectorBtnClick(this.boxSelectorBtn); }
    });
    this.sphereSelectorBtn.addEventListener('click', () => {
      if (this.currentBtn === this.sphereSelectorBtn) { return; }
      else { this.onSelectorBtnClick(this.sphereSelectorBtn); }
    });
  }

  public setOnSelectorChangeCB(callback: (selectorName: SelectorNameType, lastSelectorName: SelectorNameType) => void) {
    this.selectorChangeCB = callback;
  }

  private onSelectorBtnClick = (btn: HTMLElement) => {
    const lastSelectorName = this.getSelectorNameByBtn(this.currentBtn);
    this.unselectBtn(this.currentBtn);
    this.selectBtn(btn);
    this.currentBtn = btn;
    const selectorName = this.getSelectorNameByBtn(btn);
    if (this.selectorChangeCB) {
      this.selectorChangeCB(selectorName, lastSelectorName);
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
