const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'development') {
      // Allow localhosts during development
      return ['http://localhost:3000', 'http://127.0.0.1:5500'].includes(origin)
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    } else {
      // Allow the production domain in production
      const allowedOrigin = process.env.ALLOWED_ORIGINS;
      return origin === allowedOrigin
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Optional: Allow cookies across origins (if needed)
};

app.use(cors(corsOptions));