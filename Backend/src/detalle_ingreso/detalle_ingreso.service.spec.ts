import { Test, TestingModule } from '@nestjs/testing';
import { DetalleIngresoService } from './detalle_ingreso.service';

describe('DetalleIngresoService', () => {
  let service: DetalleIngresoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleIngresoService],
    }).compile();

    service = module.get<DetalleIngresoService>(DetalleIngresoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
