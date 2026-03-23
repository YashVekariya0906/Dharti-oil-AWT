const { syncDatabase } = require('./models');

async function testSync() {
  console.log('Testing database synchronization...');
  await syncDatabase();
  console.log('Database sync completed successfully!');
  process.exit(0);
}

testSync().catch(console.error);