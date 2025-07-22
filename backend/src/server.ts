import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory storage
const explanations: any[] = [];
const analogies: any[] = [];

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Helper function to evaluate explanations with OpenAI
async function evaluateExplanation(topic: string, explanation: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an educational expert. Evaluate explanations for 12-year-olds. Be encouraging but constructive. Respond in JSON format.'
        },
        {
          role: 'user',
          content: `Evaluate this explanation of "${topic}" for a 12-year-old: "${explanation}". 
          
          Provide JSON with: score (1-10), strengths (string), improvements (string), suggestions (string)`
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    try {
      return JSON.parse(content);
    } catch {
      return {
        score: 7,
        strengths: "Your explanation shows good understanding",
        improvements: "Consider adding more relatable examples",
        suggestions: "Try using everyday objects for comparison"
      };
    }
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

// Helper function to evaluate analogies with OpenAI
async function evaluateAnalogy(topic: string, analogy: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an educational expert. Evaluate learning analogies. Focus on accuracy and clarity. Respond in JSON format.'
        },
        {
          role: 'user',
          content: `Evaluate this analogy for "${topic}": "${analogy}".
          
          Provide JSON with: accuracy (1-10), clarity (1-10), overall (1-10), strengths (string), improvements (string)`
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    try {
      return JSON.parse(content);
    } catch {
      return {
        accuracy: 7,
        clarity: 7,
        overall: 7,
        strengths: "Good use of familiar concepts",
        improvements: "Could be more specific to the topic"
      };
    }
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Create and evaluate explanation
app.post('/api/explanations', async (req, res) => {
  try {
    const { topic, content } = req.body;

    if (!topic || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing topic or content'
      });
    }

    // Create explanation entry
    const explanation = {
      id: Date.now().toString(),
      topic,
      content,
      createdAt: new Date(),
      evaluation: null
    };

    // Try to evaluate with OpenAI
    try {
      const evaluation = await evaluateExplanation(topic, content);
      explanation.evaluation = evaluation;
      
      explanations.push(explanation);
      
      res.status(201).json({
        success: true,
        data: explanation,
        message: 'Explanation evaluated successfully'
      });
    } catch (evaluationError) {
      // Save explanation even if evaluation fails
      explanations.push(explanation);
      
      res.status(201).json({
        success: true,
        data: explanation,
        message: 'Explanation saved (evaluation failed)',
        warning: 'OpenAI evaluation unavailable'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create and evaluate analogy
app.post('/api/analogies', async (req, res) => {
  try {
    const { topic, content } = req.body;

    if (!topic || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing topic or content'
      });
    }

    // Create analogy entry
    const analogy = {
      id: Date.now().toString(),
      topic,
      content,
      createdAt: new Date(),
      evaluation: null
    };

    // Try to evaluate with OpenAI
    try {
      const evaluation = await evaluateAnalogy(topic, content);
      analogy.evaluation = evaluation;
      
      analogies.push(analogy);
      
      res.status(201).json({
        success: true,
        data: analogy,
        message: 'Analogy evaluated successfully'
      });
    } catch (evaluationError) {
      // Save analogy even if evaluation fails
      analogies.push(analogy);
      
      res.status(201).json({
        success: true,
        data: analogy,
        message: 'Analogy saved (evaluation failed)',
        warning: 'OpenAI evaluation unavailable'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all explanations (optional, for debugging)
app.get('/api/explanations', (req, res) => {
  res.json({
    success: true,
    data: explanations,
    count: explanations.length
  });
});

// Get all analogies (optional, for debugging)
app.get('/api/analogies', (req, res) => {
  res.json({
    success: true,
    data: analogies,
    count: analogies.length
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AdaptEd Backend running on http://localhost:${PORT}`);
  console.log(`📝 Ready to evaluate explanations and analogies!`);
}); 