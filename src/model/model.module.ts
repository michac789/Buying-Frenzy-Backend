import { Module, Global } from "@nestjs/common";
import { ModelService } from "./model.service";


@Global()
@Module({
    providers: [ModelService],
    exports: [ModelService],
})
export class ModelModule {}
