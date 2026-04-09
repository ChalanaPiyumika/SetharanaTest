try {
    console.log('Starting server...');
    const app = require('./app');
    console.log('App loaded successfully');
    require('./server');
} catch (error) {
    console.error('SERVER STARTUP ERROR:');
    console.error(error);
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('Module not found:', error.requireStack);
    }
}
