import { Decimal } from "@prisma/client/runtime";

export class MenuDto {
  dishName: string;
  price: Decimal;
}
