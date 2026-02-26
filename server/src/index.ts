import app from './app';
import './config/redis';
import '../workers/recommendation.worker';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
