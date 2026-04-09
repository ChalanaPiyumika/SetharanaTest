const app = require('./app');
const { initializeDatabase } = require('./infrastructure/database');
const env = require('./shared/config/env');

/**
 * Server Initialization
 * Connects to database and starts the server
 */

const startServer = async () => {
    try {
        // Initialize database connection
        await initializeDatabase();

        // Start server
        const PORT = env.PORT;
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${env.NODE_ENV}`);
            console.log(`🗄️  Database: ${env.DB_NAME}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Start the server
startServer();
