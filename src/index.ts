import path from 'path';
import { PCDConverter } from './converter/pcdConverter';
import { PCTreeScene } from './render/scene';
import { PCTreeRenderer } from './render/renderer';
import { ConverterTree } from './converter/converterTree';
import { deserializeIndex } from './common/serialize';
import { RenderTree } from './tree/renderTree';

(async () => {
  const container = document.getElementById('container') as HTMLElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const scene = new PCTreeScene(container, canvas);
  const converter = new PCDConverter();
  let tree: ConverterTree | null = await converter.read(path.resolve(__dirname, '../data/test.pcd'));
  console.log(tree);
  tree = null;
  const renderTree = await deserializeIndex('../../output/index', false) as RenderTree;
  const renderer = new PCTreeRenderer(renderTree);
  await renderer.renderTotalTree(scene.getScene(), scene.getCamera());
})();
