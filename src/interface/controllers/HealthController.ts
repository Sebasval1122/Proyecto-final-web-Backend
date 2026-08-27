import { Request, Response } from 'express';
import { sql } from '../../infrastructure/database/postgres';

export class HealthController {
  /**
   * GET /api/health
   * Check básico de salud del servicio
   */
  async health(req: Request, res: Response) {
    const start = Date.now();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${Date.now() - start}ms`
    });
  }

  /**
   * GET /api/health/ready
   * Check de readiness: verifica que la DB esté conectada
   */
  async ready(req: Request, res: Response) {
    const start = Date.now();

    try {
      // Query simple para verificar conexión
      const result = await sql`SELECT 1 as connected`;
      const isDbConnected = result.length > 0 && result[0].connected === 1;

      const status = isDbConnected ? 'ready' : 'degraded';
      const statusCode = isDbConnected ? 200 : 503;

      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        database: isDbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        responseTime: `${Date.now() - start}ms`
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
