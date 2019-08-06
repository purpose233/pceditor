import { PCTree, BoundingBox } from '../common/pcTree';

export abstract class BaseConverter {

  public abstract async readBoundingBox(path: string): Promise<BoundingBox>;
  public abstract async read(path: string): Promise<PCTree>;
}