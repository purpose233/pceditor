import { PCDConverter } from './converter/pcdConverter';
import { PCScene } from './render/scene';
import { PCRenderer } from './render/renderer';
import { ConverterTree } from './converter/converterTree';
import { deserializeIndex } from './common/serialize';
import { RenderTree } from './tree/renderTree';
import { ExportIndexPath } from './common/constants';

(async () => {
  const container = document.getElementById('container') as HTMLElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  // const converter = new PCDConverter();
  // let tree: ConverterTree | null = await converter.read(path.resolve(__dirname, '../data/test.pcd'));
  // console.log(tree);
  // tree = null;
  const renderTree = await deserializeIndex(ExportIndexPath, false) as RenderTree;
  console.log(renderTree);
  const renderer = new PCRenderer(renderTree);
  const scene = new PCScene(container, canvas, renderer);
  await renderer.renderTotalTree(scene.getScene(), scene.getCamera());
})();
