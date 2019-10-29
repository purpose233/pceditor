import path from 'path';
import { PCDConverter } from './converter/pcdConverter';
import { PCScene } from './render/scene';
import { PCRenderer } from './render/renderer';
import { ConverterTree } from './converter/converterTree';
import { deserializeIndex } from './common/serialize';
import { RenderTree } from './render/renderTree';
import { ExportIndexPath } from './common/constants';
import { exportToPCD } from './export/exportToPCD';
import { SelectorController } from './menu/selector';
import { SelectorNameType } from './common/types';

(async () => {
  
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

  const selectorController = new SelectorController();
  selectorController.init();
  selectorController.setOnSelectorChangeCB((selectorName: SelectorNameType): void => {
    if (!selectorName) { 
      renderer.removeSelector(scene, camera); 
    } else {
      renderer.addSelector(selectorName, scene, camera);
    }
  });

  // setTimeout(() => {
  //   exportToPCD('/home/purpose/Projects/web/output/out.pcd', renderTree);
  // }, 1000);
})();
