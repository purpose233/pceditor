import path from 'path';
import { PCDConverter } from './converter/pcdConverter';
import { PCScene } from './render/scene';
import { PCRenderer } from './render/renderer';
import { ConverterTree } from './converter/converterTree';
import { deserializeIndex } from './common/serialize';
import { RenderTree } from './render/renderTree';
import { ExportIndexPath } from './common/constants';
import { exportToPCD } from './export/exportToPCD';
import { SelectorController } from './ui/selectorController';
import { SelectorNameType, RenderInfoType } from './common/types';
import { OperationController } from './ui/operationController';
import { ToastController } from './ui/toastController';
import { RenderController } from './ui/renderController';
import { generateConfig, checkConfig } from './app/config';

(async () => {

  if (!checkConfig(__dirname)) { generateConfig(__dirname); }

  const container = document.getElementById('canvas-container') as HTMLElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  
  // const converter = new PCDConverter();
  // let tree: ConverterTree | null = await converter.read(path.resolve(__dirname, '../data/test.pcd'));
  // console.log(tree);
  // tree = null;
  
  const renderTree = await deserializeIndex(ExportIndexPath, false) as RenderTree;
  console.log(renderTree);
  const renderer = new PCRenderer(renderTree);
  const pcScene = new PCScene(container, canvas, renderer);
  const scene = pcScene.getScene();
  const camera = pcScene.getCamera();

  const toastController = new ToastController();
  toastController.init();
  (window as any).toast = toastController;

  const selectorController = new SelectorController();
  selectorController.init();
  selectorController.setOnSelectorChangeCB(async (selectorName: SelectorNameType): Promise<void> => {
    if (!selectorName) { 
      renderer.removeSelector(scene, camera); 
    } else {
      renderer.addSelector(selectorName, scene, camera);
    }
  });

  const renderController = new RenderController();
  renderController.init();
  renderer.setRenderInfoChangeCB((info: RenderInfoType) => {
    renderController.setRenderInfo(info);
  });

  const operationController = new OperationController();
  operationController.init();
  operationController.setOnConfirmExportCB(async (path: string) => {
    const filePath = path + '/out.pcd';
    operationController.waitExportModal();
    await exportToPCD(filePath, renderTree);
    await new Promise((resolve) => {setTimeout(() => {
      resolve();
    }, 1000);})
    operationController.unwaitExportModal();
    operationController.closeExportModal();
    toastController.showToast('success', 'Export', 'Successfully export to ' + filePath);
  });
})();
