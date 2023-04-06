import { Module } from '@nestjs/common';
import { SampleService } from './sample.service.js';
import { SampleController } from './sample.controller.js';

@Module({
  imports: [],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
