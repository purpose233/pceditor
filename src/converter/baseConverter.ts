import { RenderTree } from '../tree/renderTree';
import { BoundingBoxType } from '../common/types';

export abstract class BaseConverter {

  public abstract async readBoundingBox(path: string): Promise<BoundingBoxType>;
  public abstract async read(path: string): Promise<RenderTree>;
}