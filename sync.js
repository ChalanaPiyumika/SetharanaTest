const { initializeDatabase, sequelize } = require('./src/infrastructure/database/index');

async function sync() {
    try {
        await initializeDatabase();
        console.log('Sync complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

sync();
