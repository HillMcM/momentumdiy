import { Router } from 'express';

const router = Router();

// Test GET endpoint
router.get('/test', (_req, res) => {
  res.json({ success: true, message: 'Test GET endpoint working!' });
});

// Test PUT endpoint
router.put('/test-put', (req, res) => {
  res.json({ success: true, message: 'Test PUT endpoint working!', body: req.body });
});

// Test PUT endpoint with parameter
router.put('/test-put/:id', (req, res) => {
  res.json({ success: true, message: 'Test PUT with param working!', id: req.params.id, body: req.body });
});

export default router;
