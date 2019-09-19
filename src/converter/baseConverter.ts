import { BoundingBoxType } from '../common/types';
import { ConverterTree } from './converterTree';

export abstract class BaseConverter {

  public abstract async readBoundingBox(path: string): Promise<BoundingBoxType>;
  public abstract async read(path: string): Promise<ConverterTree>;
}