const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyToken } = require('./authRoutes');

// @route POST /api/mood
// @desc Add a new mood entry
router.post('/', verifyToken, async (req, res) => {
  try {
    const { mood, energyLevel, sleepQuality, stressLevel, notes } = req.body;
    
    const { data: savedEntry, error } = await supabase
      .from('mood_entries')
      .insert([
        {
          user_id: req.userId,
          mood,
          energy_level: energyLevel,
          sleep_quality: sleepQuality,
          stress_level: stressLevel,
          notes
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save mood entry', details: error.message });
  }
});

// @route GET /api/mood
// @desc Get mood history for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    
    const { data: history, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', req.userId)
      .order('date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood history', details: error.message });
  }
});

module.exports = router;
