//DEPENDENCIES
var fs = require("fs"); //Nodejs File System
var timestp = require("./timestamp.js"); //Timestamp code
var sys = require('sys');
var exec = require('child_process').exec;

//SIMULATE OPENSTUDIO
module.exports = {energyplus: function(request, response) {

    console.log('EnergyPlus on Node.js Express starting up...');
    console.log('FORM DATA:');
    console.log(request.body);

    //CREATE unique simulation Name & Timestamp ID
    console.log("Creating unique Building Name & Folder...");
    var buildingName = request.body.buildingName.replace(/\s+/g, '') || "NoName";
    var timestamp = timestp.createTimestamp();
    var simulationID =  buildingName+timestamp;

    //CREATE unique simulation Folder
    var simulationsPath = "../simulations/";  //CHANGE for your local setup: update bitnami to your username, make simulations directory
    var outputPath = simulationsPath + simulationID +"/";
    fs.mkdirSync(outputPath, function(error) {if (error) throw error;});
    
    //SAVE idf file
    var idfName = simulationID+'_input.idf'
    fs.writeFile(outputPath+idfName, request.body.inputDataFile, function(error){if (error) throw error;});

    fileName = outputPath;		// set global variable from app.js to simulationID

    //FORMAT request.body json to match buildingData2.json
    var buildingJSONName = outputPath + simulationID +'_input.json';
    console.log("BUILDING DATA:");
    var buildingJSON =
        {
        "simulationID": simulationID,
        "buildingName": buildingName,
        "weather": request.body.weather,
        "idfName": idfName,
        "outputPath": outputPath
        };

    console.log(buildingJSON);

    //SAVE formatted json to outputPath with name buildingNameTimestamp_input.json
    var fileString = JSON.stringify(buildingJSON, null, 4);
    fs.writeFileSync(buildingJSONName, fileString);
    console.log('Input file saved!');

    function puts(error, stdout, stderr) { sys.puts(stdout); }
    exec('node ./routes/openstudio-run.js '+buildingJSONName+' 2>&1 | tee progress.txt', function(error, stdout, stderr){
        response.redirect(outputPath);
    });

}//end openstudio
};//end exports

