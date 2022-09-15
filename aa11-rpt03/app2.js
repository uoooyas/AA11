var express = require('express');
var app = express();
var port = 3030;

var path = require('path');

app.get('/', function(req,res){
    res.send('<a href="/hello">Hello Page</a>');
});

app.get('/hello', function(req, res){
    res.send('Hello aa11');
});

app.get('/comsi', function(req, res){
    res.send('Hello Comsi!');제목	
tls
요일	  
});

app.use(express.static(path.join(__dirname,'public')));

var server = app.listen(port, function(){
    console.log('listening on port %d', server.address().port);
});

