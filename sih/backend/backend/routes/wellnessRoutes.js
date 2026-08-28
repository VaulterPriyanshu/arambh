const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyToken } = require('./authRoutes');

// @route POST /api/wellness/sessions
// @desc Log a wellness session (yoga, meditation, etc)
router.post('/sessions', verifyToken, async (req, res) => {
  try {
    const { type, title, duration } = req.body;
    
    const { data: savedSession, error } = await supabase
      .from('wellness_sessions')
      .insert([
        {
          user_id: req.userId,
          type,
          title,
          duration
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log wellness session', details: error.message });
  }
});

// @route GET /api/wellness/sessions
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('wellness_sessions')
      .select('*')
      .eq('user_id', req.userId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wellness sessions', details: error.message });
  }
});

// @route POST /api/wellness/womens
// @desc Log menstrual cycle info (requires opt-in)
router.post('/womens', verifyToken, async (req, res) => {
  try {
    const { startDate, duration, length, symptoms, active } = req.body;
    
    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('womens_wellness')
      .select('*')
      .eq('user_id', req.userId)
      .single();
      
    let newCycleList = existingRecord ? (existingRecord.cycles || []) : [];
    
    if (startDate && duration && length) {
      newCycleList.push({
        startDate,
        duration,
        length,
        symptoms: symptoms || []
      });
    }
    
    const isActive = active !== undefined ? active : (existingRecord ? existingRecord.active : true);

    const { data: savedRecord, error } = await supabase
      .from('womens_wellness')
      .upsert({
        user_id: req.userId,
        active: isActive,
        cycles: JSON.stringify(newCycleList),
        updated_at: new Date()
      }, { onConflict: 'user_id' })
      .select()
      .single();
      
    if (error) throw error;
    res.status(200).json(savedRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update womens wellness record', details: error.message });
  }
});

// @route GET /api/wellness/womens
router.get('/womens', verifyToken, async (req, res) => {
  try {
    const { data: record, error } = await supabase
      .from('womens_wellness')
      .select('*')
      .eq('user_id', req.userId)
      .single();
      
    if (error || !record) return res.status(404).json({ active: false, cycles: [] });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch record', details: error.message });
  }
});

module.exports = router;
