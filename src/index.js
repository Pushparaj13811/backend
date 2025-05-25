import { createApp } from './config/app.js';
import { connectDB } from './config/db.js';
import env           from './config/env.js';

(async () => {
  await connectDB();
  const app = createApp();

  app.listen(env.PORT, () =>
    console.log(`🚀 Server :: http://localhost:${env.PORT}`)
  );
})();
