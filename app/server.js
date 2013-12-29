var express = require('express'),
  gameRouter = require('./gameRouter'),
  path = require('path');
 
// Create the express app. 
var app = express();

app.engine('html', require('ejs').renderFile);

 // ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
  console.log("writing cross domain headers...");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.configure(function () {
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(allowCrossDomain);
  app.use('/client', express.static(__dirname + '/client'));
  app.use(express.static(__dirname + '/client'));
});

// Create our supported routes. 
app.get('/', function(req, res){
  res.render('index.html');
});


app.get('/games', gameRouter.findAll);
app.get('/games/:id', gameRouter.findById);
app.post('/games', gameRouter.addGame);
app.put('/games/:id', gameRouter.updateGame);
app.delete('/games/:id', gameRouter.deleteGame);

// Starting listening 
app.listen(3000);
console.log('Listening on port 3000...');

console.log(__dirname);