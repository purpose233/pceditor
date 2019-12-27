import { ConverterTree } from './converterTree';
import { BoundingBox } from '../common/bbox';

export abstract class BaseConverter {

  public abstract async readBoundingBox(path: string): Promise<BoundingBox>;
  public abstract async read(filePath: string, exportPath: string): Promise<ConverterTree>;
}