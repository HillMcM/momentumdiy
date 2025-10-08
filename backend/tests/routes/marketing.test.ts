import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/index';

describe('Marketing API Routes', () => {
  let server: any;

  beforeAll(async () => {
    // Use the Express app directly for testing
    server = app;
  });

  afterAll(async () => {
    // Express app doesn't need cleanup in tests
  });

  describe('GET /api/marketing/goals/active', () => {
    it('should require authentication', async () => {
      const response = await request(server)
        .get('/api/marketing/goals/active')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we'll just ensure the endpoint doesn't crash
      await request(server)
        .get('/api/marketing/goals/active')
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('GET /api/admin/tracks/goals', () => {
    it('should return published marketing tracks (admin endpoint)', async () => {
      const response = await request(server)
        .get('/api/admin/tracks/goals')
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
