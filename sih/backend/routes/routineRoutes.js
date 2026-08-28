const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyToken } = require('./authRoutes');

// @route POST /api/routines
// @desc Create a new routine task
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, time, duration, category, notify } = req.body;
    
    const { data: savedTask, error } = await supabase
      .from('routines')
      .insert([
        {
          user_id: req.userId,
          title,
          time,
          duration,
          category,
          notify
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create routine task', details: error.message });
  }
});

// @route GET /api/routines
// @desc Get all routine tasks for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data: routines, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', req.userId)
      .order('time', { ascending: true });
      
    if (error) throw error;
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routines', details: error.message });
  }
});

// @route PUT /api/routines/:id/toggle
// @desc Toggle completion status
router.put('/:id/toggle', verifyToken, async (req, res) => {
  try {
    // 1. Fetch current status
    const { data: task, error: fetchError } = await supabase
      .from('routines')
      .select('completed')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();
      
    if (fetchError || !task) return res.status(404).json({ error: 'Task not found' });
    
    // 2. Toggle and update
    const { data: updatedTask, error: updateError } = await supabase
      .from('routines')
      .update({ completed: !task.completed })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

// @route DELETE /api/routines/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
      
    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

module.exports = router;
