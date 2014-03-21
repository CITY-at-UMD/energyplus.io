
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var connect = require('connect');

var app = express();

// Configuration

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Show Folders & Files like Apache
express.static.mime.define({'text/plain': ['idf', 'osm', 'epw', 'err', 'idd', 'eio','audit','bnd','end', 'eso','mdd','mtd','mtr','rdd','shd']});
express.static.mime.default_type = "text/plain"; //to render files without an extention, i.e. stdout, stderr
app.use(express.directory('public'));
app.use('/simulations', express.directory('../simulations', {icons:true}));
app.use('/simulations', express.static('../simulations'));

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.get('/index', function(req, res){
  res.render('index');
});

app.get('/idf-creator', function(req, res){
  res.render('idf-creator');
});

var simulate = require('./routes/simulate.js');
app.post('/simulate', simulate.energyplus);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var Tail = require('tail').Tail;
var tail;
var socketio = require('socket.io');
var server = require('http').createServer(app);
server.listen(9099);
var io = socketio.listen(server);

console.log("Socket server listening on port 9099");

var fileName = 'progress.txt';

tail = new Tail(fileName);

tail.on('line', function(data) {
  return io.sockets.emit('new-data', {
    channel: 'stdout',
    value: data
  });
});

io.sockets.on('connection', function(socket) {
  return socket.emit('new-data', {
    channel: 'stdout',
    value: "tail file " + fileName
  });
});
