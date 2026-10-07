import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ArchMind Backend (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/health (GET) should report healthy status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.services).toBeDefined();
      });
  });

  it('/api/devices (GET) should return list of registered devices', () => {
    return request(app.getHttpServer())
      .get('/api/devices')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('/api/devices (POST) should register a new device and return it', () => {
    const newDevice = {
      deviceId: 'esp32-e2e-test',
      name: 'E2E Testing Node',
      hardwareModel: 'ESP32-S3',
      firmwareVersion: '1.2.0',
      location: 'Test Bench 4',
    };

    return request(app.getHttpServer())
      .post('/api/devices')
      .send(newDevice)
      .expect(201)
      .expect((res) => {
        expect(res.body.deviceId).toBe('esp32-e2e-test');
        expect(res.body.status).toBe('offline');
      });
  });

  it('/api/telemetry (POST) should ingest telemetry and calculate power', () => {
    const telemetry = {
      deviceId: 'esp32-e2e-test',
      timestamp: new Date().toISOString(),
      voltage: 230.0,
      current: 4.0,
      powerFactor: 1.0,
      temperature: 32.5,
    };

    return request(app.getHttpServer())
      .post('/api/telemetry')
      .send(telemetry)
      .expect(201)
      .expect((res) => {
        expect(res.body.power).toBe(920);
      });
  });

  it('/api/agent/analyze (POST) should return structured engineering recommendations', () => {
    const payload = {
      task: 'Evaluate buck converter ripple filter',
      context: {
        hardware: [{ component: 'Buck Converter', fswKhz: 500, vout: 3.3 }],
        requirements: [{ maxRippleMv: 20 }],
      },
    };

    return request(app.getHttpServer())
      .post('/api/agent/analyze')
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body.summary).toBeDefined();
        expect(Array.isArray(res.body.architecture)).toBe(true);
        expect(res.body.confidence).toBeGreaterThan(0.5);
      });
  });
});
