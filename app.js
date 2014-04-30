//energyplus.io

//DEPENDENCIES
var app = require('express.io')();
var express = require('express.io'); //Upgrades existing Express functionality
var path = require('path');

//SETUP EXPRESS.IO APP
app.http().io();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.directory('public'));

//SHOW FOLDERS & FILES (like Apache)
app.use('/runs', express.directory('../runs', {icons:true}));
app.use('/runs', express.static('../runs'));
express.static.mime.define({'text/plain': ['idf', 'osm', 'epw', 'err', 'idd', 'eio','audit','bnd','end', 'eso','mdd','mtd','mtr','rdd','shd']});
express.static.mime.default_type = "text/plain"; //to render files without an extention, i.e. stdout, stderr

//WEBPAGES
app.get('/', function(req, res){res.render('index');});
app.get('/index', function(req, res){res.render('index');});
app.get('/idf-creator', function(req, res){res.render('idf-creator');});
app.get('/websockets', function(req, res){res.render('websockets');});

//WEBSOCKET EVENTS
app.io.route('ready', function(req) {
    req.io.emit('connect', { 
        message: 'io event connected from an io route on the server'
    });
});

app.io.route('execute', function(req) {
    var spawn = require('child_process').spawn;
    //var file = 'progress.txt';
    var command = spawn("ls", ["-al"]);
    command.stdout.pipe(process.stdout);
    command.stdout.on("data", function (data) {
        var line = data.toString();
        req.io.emit('new-line', {message: line});
    });
    
});

app.io.route('run', function(req) {
    console.log('EnergyPlus on Node.js starting up...');
    console.log('FORM DATA:');
    console.log(req.data);
    var querystring = require('querystring');
    var building = querystring.parse(req.data);
    console.log(building);
    
    var string = JSON.stringify(building);
    req.io.emit('form-data', {message: string});

    //CREATE unique simulation Name & Timestamp ID
    console.log("Creating unique Building Name & Folder...");
    var buildingName = building.buildingName.replace(/\s+/g, '') || "NoName";
    var timestamp = require("./routes/timestamp.js").createTimestamp();
    var simulationID =  buildingName+timestamp;

    //CREATE unique simulation Folder
    var outputPath = "../runs/" + simulationID +"/"; //CREATE or UPDATE "runs" for your local setup
    var fs = require("fs");
    fs.mkdirSync(outputPath, function(error) {if (error) throw error;});
    
    //SAVE idf file
    var idfName = simulationID+'_input.idf'
    fs.writeFile(outputPath+idfName, building.inputDataFile, function(error){if (error) throw error;});

    //FORMAT request.body json to match buildingData2.json
    var buildingJSONName = outputPath + simulationID +'_input.json';
    console.log("BUILDING DATA:");
    var buildingJSON =
        {
        "simulationID": simulationID,
        "buildingName": buildingName,
        "weather": building.weather,
        "idfName": idfName,
        "outputPath": outputPath
        };

    console.log(buildingJSON);

    //SAVE formatted json to outputPath with name buildingNameTimestamp_input.json
    var fileString = JSON.stringify(buildingJSON, null, 4);
    req.io.emit('form-data', {message: fileString});
    fs.writeFileSync(buildingJSONName, fileString);
    console.log('Input file saved!');
    
    var fork = require('child_process').fork;
    var command = fork("./routes/openstudio-run.js", [buildingJSONName], {silent: true }); //silent because http://stackoverflow.com/questions/22275556/node-js-forked-pipe
    command.stdout.pipe(process.stdout);
    command.stdout.pipe(process.stderr);
    command.stdout.on("data", function (data) {
        var line = data.toString();
        req.io.emit('form-data', {message: line});
    });
    command.stderr.on("data", function (data) {
        var line = data.toString();
        req.io.emit('form-data', {message: line});
    });
    
});


//ENERGYPLUS as a SERVICE (over POST)
var simulate = require('./routes/run.js');
app.post('/simulate', simulate.energyplus);

//START SERVER
app.listen(app.get('port'), function(){
  console.log('Express & Socket listening on port ' + app.get('port'));
});
