import path from 'path';
import { PCDConverter } from './converter/pcdConverter';
import { PCTreeScene } from './render/scene';

(async () => {
  const converter = new PCDConverter();
  const tree = await converter.read(path.resolve(__dirname, '../data/test.pcd'));
  console.log(tree);

  const container = document.getElementById('container') as HTMLElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const scene = new PCTreeScene(container, canvas);
})();
