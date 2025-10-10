import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { ErrorHandler, arcjetMiddleware } from './middlewares/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(
  cors({
    origin: '*', // Sementara allow all origins untuk testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(arcjetMiddleware);

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UPT-PIK Backend API',
    version: '1.0.0',
  });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

// Function untuk start traditional server
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   🚀 Server UPT-PIK Backend           ║
║                                       ║
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║   URL: http://localhost:${PORT}          ║
║   API: http://localhost:${PORT}/api      ║
║                                       ║
╚═══════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Deteksi environment: serverless atau traditional server
const isServerless =
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  process.env.FUNCTION_NAME;

// Hanya start server jika BUKAN serverless environment
if (!isServerless) {
  startServer();
}

// Export app untuk serverless platforms (Vercel, Netlify, AWS Lambda, dll)
export default app;
