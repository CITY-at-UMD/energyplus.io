var fs = require("fs"); //Nodejs File System
//var openstudio = require("OpenStudio").openstudio;

console.log("READ BUILDING INPUT JSON:");//------------------------------------------------------------------------------

var building = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); 
            var simulationID = building.simulationID;
            var buildingName = building.buildingName;
            var weather = building.weather;
            var idfName = building.idfName;
            var outputPath = building.outputPath;

console.log("Name: "+ buildingName);
console.log("Weather: "+ weather);

console.log("SETUP OPENSTUDIO RUNMANAGER:");//----------------------------------------------------------------------------

//Debugging Output Level (High = -3, Medium = -2, Low = -1)
openstudio.Logger.instance().standardOutLogger().setLogLevel(-3);

// Disable the gui (true, false, false) this makes the xvfb no longer necessary
var runmanager = new openstudio.runmanager.RunManager(true, false, false);
var co = runmanager.getConfigOptions();
co.fastFindEnergyPlus();
runmanager.setConfigOptions(co);

console.log("RUN ENERGYPLUS:");//------------------------------------------------------------------------------------------

function runEnergyPlus(outputPath, idfName) {
    var weatherPath = runmanager.getConfigOptions().getDefaultEPWLocation();
    var epwPath = new openstudio.path(openstudio.toString(weatherPath) + "/" + weather + ".epw");
    var tools = runmanager.getConfigOptions().getTools();
    var idfPath = new openstudio.path(outputPath + "/" + idfName);
    var energyplusOutputPath = new openstudio.path(outputPath);
    var workflow = new openstudio.runmanager.Workflow("EnergyPlusPreProcess->EnergyPlus");
    workflow.add(tools);
    workflow.addParam(new openstudio.runmanager.JobParam("flatoutdir"));
    console.log("EPW path: " + openstudio.toString(epwPath) + " epw exists: " + openstudio.exists(epwPath));
    
    var job = workflow.create(energyplusOutputPath, idfPath, epwPath);
    
    runmanager.enqueue(job, true);
    runmanager.setPaused(false);
    
    runmanager.waitForFinished();
    return job;
}

var job = runEnergyPlus(outputPath, idfName);

var treeerrors = job.treeErrors();

console.log("OUTPUT SUMMARY:");//------------------------------------------------------------------------------------------
console.log("Job Succeeded: " + treeerrors.succeeded());

var errors = treeerrors.errors();
var warnings = treeerrors.warnings();

for (var i = 0; i < errors.size(); ++i)
{
  console.log("Error: " + errors.get(i));
}

for (var i = 0; i < warnings.size(); ++i)
{
  console.log("Warning: " + warnings.get(i));
}