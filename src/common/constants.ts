import { Color } from 'three';

// Real World -> Three.js
export const AxisRatio = 1.0;

export const DefaultPointSize = 0.05;
export const DefaultPointColor = new Color(0xf56f70);
export const SelectedPointColor = new Color(0xff2222);
export const SelectedSelectorColor = new Color(0xffff00);
export const UnselectedSelectorColor = new Color(0x00ff00);

export const GridSize = 128;
export const NodeStackMax = 128;

// Max converter threshold should be greater than a fulfilled node,
//  which has 128^3+128*8=209,8176 points.
// BUT, in fact it's quite hard to fulfill a node by real-world 
//  point cloud. So, it could be set smaller than a fulfilled node.
// And it could be convconvenient to reduce the de&serializing operations.
export const MaxConverterThreshold = 1000000;

export const MaxRenderNodes = 100;

// TODO: fix the hardcoding
export const ExportFolderPath = '/home/purpose/Projects/web/output/';
export const ExportIndexPath = ExportFolderPath + 'index';
export const ExportDataPath = ExportFolderPath + 'n';

export const DefaultBoxSelectorWidth = 10;
export const DefaultBoxSelectorHeight = 10;
export const DefaultSphereSelectorRadius = 5; 
export const DefaultSphereSelectorSegments = 64;