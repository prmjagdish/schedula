import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return Hello World from root route handler', () => {
    expect(appController.getHello()).toBe('Hello World');
  });

  it('should return Hello World from /hello route handler', () => {
    expect(appController.getHelloRoute()).toBe('Hello World');
  });
});

