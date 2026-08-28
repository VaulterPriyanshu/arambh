const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyToken } = require('./authRoutes');

// @route POST /api/screenings
// @desc Save a new screening
router.post('/', verifyToken, async (req, res) => {
  try {
    const { tool, concern, answers, score, severity, contextualAnswers } = req.body;
    
    const { data: savedScreening, error } = await supabase
      .from('screenings')
      .insert([
        {
          user_id: req.userId,
          tool,
          concern,
          answers: JSON.stringify(answers),
          score,
          severity,
          contextual_answers: JSON.stringify(contextualAnswers)
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(savedScreening);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save screening', details: error.message });
  }
});

// @route GET /api/screenings
// @desc Get all screenings for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data: screenings, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('user_id', req.userId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch screenings', details: error.message });
  }
});

module.exports = router;
