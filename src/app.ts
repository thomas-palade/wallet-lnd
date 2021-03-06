import express from 'express';
const app = express();
const port = 3000;

// Gracefull shutdown
import { close } from './lib/postgres/pool';
import util from 'util';

// Endpoints
import setupWalletRoutes from './wallets/routes';
setupWalletRoutes(app);

process.on('SIGTERM', () => {
  console.log(
    `Wallet service received 'SIGTERM'. Initiating graceful shutdown.`
  );

  const serverStop = util.promisify(server.stop);
  const poolClose = util.promisify(close);

  setTimeout(async () => {
    await serverStop();
    await poolClose(null);
    console.log(`Wallet service finished graceful shutdown.`);
  }, 5000);
});

// Start
import stoppable from 'stoppable';

const server = stoppable(
  app.listen(port, () => console.log(`Express is listening at http://localhost:${port}`))
);

