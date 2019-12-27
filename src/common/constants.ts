import { Color } from 'three';
import path from 'path';

// Real World -> Three.js
export const AxisRatio = 1.0;

// -- MNO tree building --
export const GridSize = 128;
export const NodeStackMax = 128;

// -- Point cloud rendering --
export const MaxRenderNodes = 20;

export const OutlineColor = new Color(0x000000);
export const OutlineRatio = 1.25;
export const DefaultPointSize = 0.1;
export const DefaultPointColor = new Color(0xffffff);
export const SelectedPointColor = new Color(0xf56f70);
export const SelectorColor = new Color(0x00ff00);
export const BBoxColor = new Color(0xaaaaaa);

// -- Gizmo rendering --
export const GizmoXColor = new Color(0xaa0000);
export const GizmoYColor = new Color(0x00aa00);
export const GizmoZColor = new Color(0x0000aa);
export const GizmoXHighlightColor = new Color(0xff6666);
export const GizmoYHighlightColor = new Color(0x66ff66);
export const GizmoZHighlightColor = new Color(0x6666ff);
export const GizmoArrowSegments = 20;
export const GizmoArrowTopHeight = 0.1;
export const GizmoArrowTopRadius = 0.05;
export const GizmoArrowBodyRadius = 0.015;
export const GizmoArrowBodyHeight = 1;
export const GizmoSphereRadius = 0.05;
export const GizmoSphereSegments = 20;

// -- Selector attributes --
export const MinSphereSelectorRadius = 0.5;
export const DefaultSphereSelectorRadius = 2; 
export const DefaultSphereSelectorSegments = 64;
export const MinBoxSelectorSize = 1;
export const DefaultBoxSelectorSize = 4;

// -- Point cloud converter --
// Max converter threshold should be greater than a fulfilled node,
//  which has 128^3+128*8=209,8176 points.
// BUT, in fact it's quite hard to fulfill a node by real-world 
//  point cloud. So, it could be set smaller than a fulfilled node.
// And it could be convconvenient to reduce the de&serializing operations.
export const MaxConverterThreshold = 1000000;

// -- UI --
export const DefaultToastDelay = 2000;
export const ToastSuccessColor = '#28a745';
export const ToastWarningColor = '#fbc108';
export const ToastErrorColor = '#dc3545';
export const ToastInfoColor = '#2da2b8';

export const ConfigFileDirName = '.config';
export const ConfigFileName = 'manifest.json';

export const ExportTempPostfix = '.temp';
export const ExportIndexName = '/index';
export const ExportDataName = '/n';
