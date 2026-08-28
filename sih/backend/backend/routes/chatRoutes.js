const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const supabase = require('../utils/supabase');
const { verifyToken } = require('./authRoutes');

// @route POST /api/chat
// @desc Send a message to MindGuide AI
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // 1. Get AI Response
    const aiResponseText = await aiService.generateResponse(message, context);
    
    // 2. Fetch or Create Session
    let { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!session) {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert([{ user_id: req.userId, context: JSON.stringify(context) }])
        .select()
        .single();
        
      if (createError) throw createError;
      session = newSession;
    }
    
    // 3. Insert Messages
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert([
        { session_id: session.id, role: 'user', content: message },
        { session_id: session.id, role: 'assistant', content: aiResponseText }
      ]);
      
    if (insertError) throw insertError;
    
    // Update session timestamp
    await supabase.from('chat_sessions').update({ updated_at: new Date() }).eq('id', session.id);
    
    // 4. Return response
    res.json({ reply: aiResponseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

// @route GET /api/chat/history
// @desc Get recent chat history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!session) return res.json([]);
    
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history', details: error.message });
  }
});

module.exports = router;
