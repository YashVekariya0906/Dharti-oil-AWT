const { GlobalPrice, Broker, syncDatabase } = require('./models');

async function testAPI() {
  try {
    console.log('=== DATABASE TEST ===\n');

    // Sync database
    await syncDatabase();
    console.log('\n✅ Database synced');

    // Check GlobalPrice table
    console.log('\n--- GlobalPrice Table ---');
    let globalPrice = await GlobalPrice.findOne();
    console.log('Existing GlobalPrice:', globalPrice ? globalPrice.toJSON() : 'None');

    if (!globalPrice) {
      globalPrice = await GlobalPrice.create({ current_price: 0 });
      console.log('Created new GlobalPrice:', globalPrice.toJSON());
    }

    // Test update
    console.log('\nTesting update...');
    await GlobalPrice.update({ current_price: 2000 }, { where: { id: globalPrice.id } });
    const updated = await GlobalPrice.findOne({ where: { id: globalPrice.id } });
    console.log('Updated GlobalPrice:', updated.toJSON());

    // Check Brokers table
    console.log('\n--- Brokers Table ---');
    const brokers = await Broker.findAll();
    console.log(`Total brokers: ${brokers.length}`);
    brokers.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name} (${b.email}) - Status: ${b.status}, Verified: ${b.otp_code === null ? 'Yes' : 'No'}`);
    });

    console.log('\n✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAPI();
