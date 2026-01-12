import { Test, TestingModule } from '@nestjs/testing';
import { NotaIngresoService } from './nota_ingreso.service';

describe('NotaIngresoService', () => {
  let service: NotaIngresoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotaIngresoService],
    }).compile();

    service = module.get<NotaIngresoService>(NotaIngresoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
