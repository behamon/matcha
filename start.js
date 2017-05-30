// Entry Point !

const mongoose = require('mongoose');

// Check for node version (7.6+ required)
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log('Node.js version is too old. Please use 7.6 or above');
  process.exit();
}

// Load *variables.env* into proccess.env

require('dotenv').config({ path: 'variables.env' });

// Database connection and error handling

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(`ERROR → ${err.message}`);
});

// Import models

TODO
// require('./models/Store');

const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
