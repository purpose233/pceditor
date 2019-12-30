import path from 'path';
import fs from 'fs';
import { ConfigFileDirName, ConfigFileName } from '../common/constants';
import { ManifestType } from '../common/types';

export function validateConfig(str: string): boolean {
  return true;
}

export function generateConfig(dirname: string): ManifestType {
  const dirPath = path.resolve(dirname, './' + ConfigFileDirName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const config: ManifestType = {
    projects: []
  };
  // override old config file anyway
  writeConfig(dirname, config);
  return config;
}

export function writeConfig(dirname: string, config: ManifestType): void {
  const dirPath = path.resolve(dirname, './' + ConfigFileDirName);
  const configFilePath = dirPath + '/' + ConfigFileName;
  fs.writeFileSync(configFilePath, JSON.stringify(config), { encoding: 'utf8' });
}

export function parseConfig(dirname: string): ManifestType | null {
  const dirPath = path.resolve(dirname, './' + ConfigFileDirName);
  const configFilePath = dirPath + '/' + ConfigFileName;
  if (!fs.existsSync(dirPath) || !fs.existsSync(configFilePath)) { return null; }
  const str = fs.readFileSync(configFilePath, { encoding: 'utf8' });
  return validateConfig(str) ? JSON.parse(str) as ManifestType : null;
}
