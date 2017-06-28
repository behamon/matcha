// Entry Point !
// Check for node version (7.6+ required)
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log('Node.js version is too old. Please use 7.6 or above');
  process.exit();
}

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const routes = require('./routes/index');
const helpers = require('./handlers/helpers');
const errorHandlers = require('./handlers/errorHandlers');
const app = express();
// const http = require('http').Server(app);

// Load *variables.env* into proccess.env

require('dotenv').config({ path: 'variables.env' });

// Start App if DB connection is done

const db = require('./controllers/dbController');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Management using MongoDB
const database = db.getConnection();
app.use(session({
	secret: process.env.SECRET,
	key: process.env.KEY,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ dbPromise: database })
}));

// Flash middleware to use req.flash()
app.use(flash());

// Passing variables to templates + all requests
app.use((req, res, next) => {
	res.locals.h = helpers;
	res.locals.flashes = req.flash();
	res.locals.user = req.session.user || null;
	res.locals.email = req.session.email || null;
	res.locals.currentPath = req.path;
	next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
	req.login = promisify(req.login, req);
	next();
});

// Routes !
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
	/* Development Error Handler - Prints stack trace */
	app.use(errorHandlers.developmentErrors);
}

app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

const io = require('socket.io')(server);
const sharedsession = require("express-socket.io-session");
io.use(sharedsession(session({
	secret: process.env.SECRET,
	key: process.env.KEY,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ dbPromise: database })
}), { autoSave: true }));

const socketHandler = require('./handlers/sockets')(io);
