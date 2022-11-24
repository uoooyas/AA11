// db33rgb.js

var serialport = require('serialport');
var portName = 'COM3';  // check your COM port!!
var port    =   process.env.PORT || 3000;  // port for DB

var io = require('socket.io').listen(port);

// MongoDB
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/iot33imu", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("mongo db connection OK.");
});
// Schema
var iotSchema = new Schema({
    date : String,
    ax : String,
    ay : String,
    az : String,
    gx : String,
    gy : String,
    gz : String,
    mx : String,
    my : String,
    mz : String

    
});
// Display data on console in the case of saving data.
iotSchema.methods.info = function () {
    var iotInfo = this.date
    ? "Current date: " + this.date +", ax: " + this.ax +", ay: " + this.ay 
    + ", az: " + this.az + ", gx: " + this.gx + ", gy: " + this.gy  
    + ", gz: " + this.gz + ", mx: " + this.mx + ", my: " + this.my + ", mz: " + this.mz
    : "I don't have a ax"
    console.log("iotInfo: " + iotInfo);
}


const Readline = require("@serialport/parser-readline");

// serial port object
var sp = new serialport(portName, {
  baudRate: 9600, // 9600  38400
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
  parser: new Readline("\r\n"),
  //   parser: serialport.parsers.readline("\r\n"), // new serialport.parsers.Readline
});

// set parser
const parser = sp.pipe(new Readline({ delimiter: "\r\n" }));

// Open the port 
// sp.on("open", () => {
//     console.log("serial port open");
//   });

var readData = '';  // this stores the buffer
var ax = '';
var ay = '';
var az = '';
var gx = '';
var gy = '';
var gz = '';
var mx = '';

var mdata =[]; // this array stores ax and data from multiple sensors
var firstcommaidx = 0;
var secondcommaidx = 0;
var thirdcommaidx = 0;
var fourthcommaidx = 0;
var fifthcommaidx = 0;
var sixthcommaidx = 0;
var seventhcomaidx = 0;
var eighthcomadix = 0;
var ninethcomadix = 0;

var Sensor = mongoose.model("Sensor", iotSchema);  // sensor data model

// process data using parser
parser.on('data', (data) => { // call back when data is received
    readData = data.toString(); // append data to buffer
    firstcommaidx = readData.indexOf(','); 
    secondcommaidx = readData.indexOf(',',firstcommaidx+1);
    thirdcommaidx = readData.indexOf(',',secondcommaidx+1);
    fourthcommaidx = readData.indexOf(',',thirdcommaidx+1);
    fifthcommaidx = readData.indexOf(',',fourthcommaidx+1);
    sixthcommaidx = readData.indexOf(',',fifthcommaidx+1);
    seventhcomaidx = readData.indexOf(',',sixthcommaidx+1);
    eighthcomadix = readData.indexOf(',',seventhcomaidx+1);
    ninethcomadix = readData.indexOf(',',eighthcomadix+1);
    // parsing data into signals
    if (readData.lastIndexOf(',') > firstcommaidx && firstcommaidx > 0) {
        ax = readData.substring(firstcommaidx + 1, secondcommaidx);
        ay = readData.substring(secondcommaidx + 1, thirdcommaidx);
        az = readData.substring(thirdcommaidx + 1, fourthcommaidx);
        gx = readData.substring(fourthcommaidx + 1, fifthcommaidx);
        gy = readData.substring(fifthcommaidx + 1, sixthcommaidx);
        gz = readData.substring(sixthcommaidx + 1, seventhcomaidx);
        mx = readData.substring(seventhcomaidx+ 1, eighthcomadix);
        my = readData.substring(eighthcomadix + 1, readData.indexOf(',',ninethcomadix+1));
        mz = readData.substring(readData.lastIndexOf(',')+1);
        
        readData = '';
        
        dStr = getDateString();
        mdata[0]=dStr;    // Date
        mdata[1]=ax;    // ay data
        mdata[2]=ay;    // az data
        mdata[3]=az;     //  gx data
        mdata[4]=gx;    // gy data
        mdata[5]=gy;       // gz
        mdata[6]=gz;       // mx
        mdata[7]=mx;       // my
        mdata[8]=my; 
        mdata[9]=mz; 
        //console.log(mdata);
        var iotData = new Sensor({date:dStr, ax:ax, ay:ay, az:az, gx:gx, gy:gy, 
            gz:gz, mx:mx, my:my, mz:mz});
        // save iot data to MongoDB
        iotData.save(function(err,data) {
            if(err) return handleEvent(err);
            data.info();  // Display the information of iot data  on console.
        })
        io.sockets.emit('message', mdata);  // send data to all clients 
    } else {  // error 
        console.log(readData);
    }
});


io.sockets.on('connection', function (socket) {
    // If socket.io receives message from the client browser then 
    // this call back will be executed.
    socket.on('message', function (msg) {
        console.log(msg);
    });
    // If a web browser disconnects from Socket.IO then this callback is called.
    socket.on('disconnect', function () {
        console.log('disconnected');
    });
});

// helper function to get a nicely formatted ax string
function getDateString() {
    var time = new Date().getTime();
    // 32400000 is (GMT+9 Korea, GimHae)
    // for your timezone just multiply +/-GMT by 3600000
    var datestr = new Date(time +32400000).
    toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}