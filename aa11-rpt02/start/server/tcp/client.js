var net = require('net');
var port = 3000;
var client = new net.Socket();
client.connect(port, "127.0.0.1");
client.on('data', function(data){
    console.log('Data: ' + data);
    client.destroy();
});

client.on('close', function(){
    console.log('Connection closed');
});