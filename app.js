/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var tasks = require('./routes/tasks');
var http = require('http');
var path = require('path');
var mongoskin = require('mongoskin');

// Initialize connection once
var db = mongoskin.db('mongodb://localhost:27017/todo');
var app = express();
app.use(function(req, res, next) {
  req.db = {};
  req.db.tasks = db.collection('tasks');
  next();
})
app.locals.appname = 'Express.js Todo App'
// all environments

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// app.use(express.favicon());
// app.use(express.logger('dev'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
// app.use(express.methodOverride());
var cookieParser = require('cookie-parser')
app.use(cookieParser())
// app.use(express.session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));
// app.use(express.csrf());

app.use(require('less-middleware')({ src: __dirname + '/public', compress: true }));
app.use(express.static(path.join(__dirname, 'public')));

var errorhandler = require('errorhandler')
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

app.param('task_id', function(req, res, next, taskId) {
  req.db.tasks.findById(taskId, function(error, task){
    if (error) return next(error);
    if (!task) return next(new Error('Task is not found.'));
    req.task = task;
    return next();
  });
});

app.get('/', routes.index);
app.get('/tasks', tasks.list);
app.post('/tasks', tasks.markAllCompleted)
app.post('/tasks', tasks.add);
app.post('/tasks/:task_id', tasks.markCompleted);
app.del('/tasks/:task_id', tasks.del);
app.get('/tasks/completed', tasks.completed);

app.all('*', function(req, res){
  res.send(404);
})
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});