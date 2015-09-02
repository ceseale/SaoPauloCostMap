/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/osms              ->  index
 */

'use strict';
var isochrone = require('osrm-isochrone');
// Gets a list of Osms
exports.index = function(req, res) {

var resolution = 25; // sample resolution
var time = 3600; // 300 second drivetime (5 minutes)
var network = '../../../Downloads/brazil-latest.osrm' // prebuild dc osrm network file
var location = [-46.648171 ,-23.539278 ]; // center point
var out = [];
var cal = [300,600,900,1200,1500];

cal.forEach(function (item , i ){
	if(i == 0){
	isochrone(location, cal[i], resolution, network, function(err, drivetime) {
  if(err) throw err;
  out.push((drivetime))
});
}
})


isochrone(location, cal[1], resolution, network, function(err, drivetime) {
  if(err) throw err;
  out.push((drivetime))
  // a geojson linestring
  res.send(JSON.stringify(out))
  //res.end('end')
});

};


  // var EdmundsClient = require('node-edmunds-api');
  // var client = new EdmundsClient({ apiKey: "KEY HERE" });
  // console.log(client.getAllMakes({}, function (err, res){
  // 	console.log(res)
  // }))

