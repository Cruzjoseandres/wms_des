import { Test, TestingModule } from '@nestjs/testing';
import { NotaIngresoController } from './nota_ingreso.controller';
import { NotaIngresoService } from './nota_ingreso.service';

describe('NotaIngresoController', () => {
  let controller: NotaIngresoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotaIngresoController],
      providers: [NotaIngresoService],
    }).compile();

    controller = module.get<NotaIngresoController>(NotaIngresoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
