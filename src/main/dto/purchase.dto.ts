import {
  IsInt,
  Min,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Menu } from '@prisma/client';

class PurchaseItemDto {
  @IsInt()
  menuId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class PurchaseDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}

export interface PurchaseHistoryWithMenu {
  id: number;
  transactionDate: Date;
  userId: number;
  menuId: number;
  menuName: string;
  menuPrice: number;
}
