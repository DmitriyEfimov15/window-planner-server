import { TypeConvaT } from 'src/types/ConvaItem.types';

export class SavePlanDto {
  convaItems: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    type: TypeConvaT;
  }[];
}
