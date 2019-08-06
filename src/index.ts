import { PCDConverter } from './converter/pcdConverter';

const converter = new PCDConverter();

converter.read('../data/test.pcd');
