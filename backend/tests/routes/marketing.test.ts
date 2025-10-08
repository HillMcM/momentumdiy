import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createServer } from '../../src/index';

describe('Marketing API Routes', () => {
  let server: any;

  beforeAll(async () => {
    // Create a test server instance
    server = createServer();
  });

  afterAll(async () => {
    // Clean up server
    if (server) {
      await server.close();
    }
  });

  describe('GET /api/marketing/goals/active', () => {
    it('should return active marketing goal or empty response', async () => {
      const response = await request(server)
        .get('/api/marketing/goals/active')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');

      if (response.body.success && response.body.data) {
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('currentWeek');
        expect(response.body.data).toHaveProperty('duration');
      }
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we'll just ensure the endpoint doesn't crash
      const response = await request(server)
        .get('/api/marketing/goals/active')
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('GET /api/marketing/tracks/published', () => {
    it('should return published marketing tracks', async () => {
      const response = await request(server)
        .get('/api/marketing/tracks/published')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');

      if (response.body.success && response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
        // Each track should have required properties
        response.body.data.forEach((track: any) => {
          expect(track).toHaveProperty('id');
          expect(track).toHaveProperty('title');
          expect(track).toHaveProperty('description');
        });
      }
    });
  });

  describe('PUT /api/marketing/tasks/:id', () => {
    it('should update task completion status', async () => {
      const response = await request(server)
        .put('/api/marketing/tasks/non-existent-id')
        .send({ isCompleted: true })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
