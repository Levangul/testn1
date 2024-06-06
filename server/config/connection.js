const mongoose = require('mongoose');

// Connect to MongoDB using the provided URI or fallback to localhost
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testN1', {
  useNewUrlParser: true, // Use the new URL parser
  useUnifiedTopology: true, // Use the new topology engine
});

// Export the connection for use in other parts of the application
module.exports = mongoose.connection;
