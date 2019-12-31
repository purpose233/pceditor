import path from 'path';
import fs from 'fs';
import uuid from 'uuid/v4';
import { PCDConverter } from './converter/pcdConverter';
import { PCScene } from './render/scene';
import { PCRenderer } from './render/renderer';
import { ConverterTree } from './converter/converterTree';
import { deserializeIndex } from './common/serialize';
import { RenderTree } from './render/renderTree';
import { exportToPCD } from './export/exportToPCD';
import { SelectorController } from './ui/selectorController';
import { SelectorNameType, RenderInfoType, ManifestType, ConfigProjectType } from './common/types';
import { OperationController } from './ui/operationController';
import { ToastController } from './ui/toastController';
import { RenderController } from './ui/renderController';
import { generateConfig, parseConfig, writeConfig } from './app/config';
import { ProjectController } from './ui/projectController';
import { ExportIndexName } from './common/constants';

declare global {
  interface Window {
    toast: ToastController
  }
}

(async () => {

  const config: ManifestType = parseConfig(__dirname) || generateConfig(__dirname);
  
  const container = document.getElementById('canvas-container') as HTMLElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let renderScene: PCScene | null = null;

  const projectController = new ProjectController();
  projectController.init();
  projectController.setFromConfig(config.projects);
  projectController.setOnUploadCB(async (file: File | null, name: string | null): Promise<boolean> => {
    // TODO: check pcd file
    // TODO: add spinner
    if (!file || !name) {
      window.toast.showToast('error', 'Upload Error', 'Project name or point cloud file cannot be empty.');
    } else if (config.projects.find((project => project.name === name))) {
      window.toast.showToast('error', 'Upload Error', 'Project name cannot repeat.')
    } else {
      const converter = new PCDConverter();
      const importPath = path.resolve(file.path);
      const exportPath = path.resolve(__dirname, './projects/' + name);
      console.log(exportPath);
      let tree: ConverterTree | null = await converter.read(importPath, exportPath);
      console.log(tree);
      tree = null;
      const project: ConfigProjectType = {
        id: uuid(),
        name, 
        path: exportPath,
        lastModified: new Date().toLocaleString()
      };
      config.projects.push(project);
      writeConfig(__dirname, config);
      projectController.addProject(project);
      return true;
    }
    return false;
  });
  projectController.setOnDeleteCB(async (id: string): Promise<boolean> => {
    projectController.deleteProject(id);
    const index = config.projects.findIndex(project => project.id === id);
    if (index >= 0) { 
      const project = config.projects.splice(index, 1)[0];
      const files = fs.readdirSync(project.path);
      for (const file of files) {
        fs.unlinkSync(path.join(project.path, file));
      }
      fs.rmdirSync(project.path);
    }
    writeConfig(__dirname, config);
    return true;
  });
  projectController.setOnEditCB(async (id: string): Promise<boolean> => {
    const project = config.projects.find(project => project.id === id);
    if (!project) { return false; }
    const renderTree = await deserializeIndex(project.path, path.join(project.path, ExportIndexName), false) as RenderTree;
    console.log(renderTree);
    const renderer = new PCRenderer(renderTree);
    const pcScene = new PCScene(container, canvas, renderer);
    renderScene = pcScene;
    const scene = pcScene.getScene();
    const camera = pcScene.getCamera();

    selectorController.setOnSelectorChangeCB(async (selectorName: SelectorNameType): Promise<void> => {
      if (!selectorName) { 
        renderer.removeSelector(scene, camera); 
      } else {
        renderer.addSelector(selectorName, scene, camera);
      }
    });
    renderer.setRenderInfoChangeCB((info: RenderInfoType) => {
      renderController.setRenderInfo(info);
    });
    operationController.setOnExportCB(async (path: string) => {
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

    return true;
  });

  const toastController = new ToastController();
  toastController.init();
  window.toast = toastController;

  const selectorController = new SelectorController();
  selectorController.init();
  // selectorController.setOnSelectorChangeCB(async (selectorName: SelectorNameType): Promise<void> => {
  //   if (!selectorName) { 
  //     renderer.removeSelector(scene, camera); 
  //   } else {
  //     renderer.addSelector(selectorName, scene, camera);
  //   }
  // });

  const renderController = new RenderController();
  renderController.init();
  // renderer.setRenderInfoChangeCB((info: RenderInfoType) => {
  //   renderController.setRenderInfo(info);
  // });

  const operationController = new OperationController();
  operationController.init();
  // operationController.setOnConfirmExportCB(async (path: string) => {
  //   const filePath = path + '/out.pcd';
  //   operationController.waitExportModal();
  //   await exportToPCD(filePath, renderTree);
  //   await new Promise((resolve) => {setTimeout(() => {
  //     resolve();
  //   }, 1000);})
  //   operationController.unwaitExportModal();
  //   operationController.closeExportModal();
  //   toastController.showToast('success', 'Export', 'Successfully export to ' + filePath);
  // });
  operationController.setOnReturnMenuCB(async () => {
    if (renderScene) {
      renderScene.drop(container);
    }
    // selectorController.setOnSelectorChangeCB(async (selectorName: SelectorNameType): Promise<void> => {});
    // operationController.setOnExportCB(async (path: string) => {});
    projectController.showProjectPanel();
  });
})();
