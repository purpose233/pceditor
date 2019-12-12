import path from 'path';
import fs from 'fs';
import { ConfigFileDirName, ConfigFileName } from '../common/constants';
import { ManifestType } from '../common/types';

export function checkConfig(dirname: string): boolean {
  const dirPath = path.resolve(dirname, './' + ConfigFileDirName);
  const configFilePath = dirPath + '/' + ConfigFileName;
  return fs.existsSync(dirPath) && fs.existsSync(configFilePath) && validateConfigFile();
}

export function validateConfigFile(): boolean {
  return true;
}

export function generateConfig(dirname: string): void {
  const dirPath = path.resolve(dirname, './' + ConfigFileDirName);
  const configFilePath = dirPath + '/' + ConfigFileName;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const manifest: ManifestType = {
    projects: []
  };
  // override old config file anyway
  fs.writeFileSync(configFilePath, JSON.stringify(manifest), { encoding: 'utf8' });
}

export function parseConfig(dirname: string): ManifestType {
  const dirPath = path.resolve(dirname, './' + ConfigFileDirName);
  const configFilePath = dirPath + '/' + ConfigFileName;
  const str = fs.readFileSync(configFilePath, { encoding: 'utf8' });
  return JSON.parse(str) as ManifestType;
}
