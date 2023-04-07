import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';

@Module({
  imports: [],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
