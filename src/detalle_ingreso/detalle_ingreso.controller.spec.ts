import { Test, TestingModule } from '@nestjs/testing';
import { DetalleIngresoController } from './detalle_ingreso.controller';
import { DetalleIngresoService } from './detalle_ingreso.service';

describe('DetalleIngresoController', () => {
  let controller: DetalleIngresoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleIngresoController],
      providers: [DetalleIngresoService],
    }).compile();

    controller = module.get<DetalleIngresoController>(DetalleIngresoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
