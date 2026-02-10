import { AppService } from '../src/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should return Hello World message', () => {
    expect(service.getHello()).toBe('Hello World');
  });
}
)

