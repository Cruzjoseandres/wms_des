import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // --- CAMBIO IMPORTANTE: Permitir todo (CORS abierto) ---
    app.enableCors();
   
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Esto se queda por si acaso, aunque ya usamos Cloudinary
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

    await app.listen(process.env.PORT || 3001);
}
bootstrap();