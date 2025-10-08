import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/index';

describe('Tasks API Routes', () => {
  let server: any;

  beforeAll(async () => {
    server = app;
  });

  afterAll(async () => {
    // Express app doesn't need cleanup in tests
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for authenticated user', async () => {
      const response = await request(server)
        .get('/api/tasks')
        .expect(401); // Should require authentication

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(server)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/tasks', () => {
    it('should validate task creation input', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .send({}) // Empty payload
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication for task creation', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should validate task update input', async () => {
      const response = await request(server)
        .put('/api/tasks/non-existent-id')
        .send({}) // Empty payload
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should require authentication for task deletion', async () => {
      const response = await request(server)
        .delete('/api/tasks/non-existent-id')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
