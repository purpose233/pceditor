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
