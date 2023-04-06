import { Controller, Post, Delete } from '@nestjs/common';
import { SampleService } from './sample.service';

/**
 * Note:
 * THESE ENDPOINT ARE CREATED FOR THE SAKE OF POPULATING/RESETING DATABASE ONLY.
 * IT IS ONLY USED FOR DIRECT TESTING PURPOSES.
 */
@Controller('sample')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  /**
   * [POST] /sample/populate/
   * Populate database with given sample data.
   * It is an async function, it will run for a few seconds after you get the response.
   */
  @Post('populate')
  async populateDatabase(): Promise<string> {
    this.sampleService.populateDatabase();
    return 'Populating database... It is an asynchronous process, please wait for a few seconds...';
  }

  /**
   * [DELETE] /sample/reset/
   * Delete all data in the database.
   * Note that it does not reset the id count back to 1 again.
   * It is an async function, it will run for a few seconds after you get the response.
   */
  @Delete('reset')
  async resetDatabase(): Promise<string> {
    this.sampleService.resetDatabase();
    return 'Deleting all data... It is an asynchronous process, please wait for a few seconds...';
  }
}
