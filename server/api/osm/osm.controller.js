/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/osms              ->  index
 */

'use strict';

   var grid = require('turf-grid'),
    destination = require('turf-destination'),
    point = require('turf-point'),
    extent = require('turf-extent'),
    featureCollection = require('turf-featurecollection'),
    polylineDecode = require('polyline').decode;

    var OSRM = require('osrm');
    var network =  __dirname + "/../../../data/sao-paulo_brazil.osrm" ;
    var osrm = new OSRM(network); 


   var EdmundsClient = require('node-edmunds-api');
   var client = new EdmundsClient({ apiKey:  'hamkxagh9shf9twh6tq6xxy4' });



   function getPolygons(center, time, resolution, network, carData , maxCost, done) {

    // compute bbox
    // bbox should go out 1.4 miles in each direction for each minute
    // this will account for a driver going a bit above the max safe speed

    var centerPt = point([center[0], center[1]]);
    var spokes = featureCollection([])
    var miles = (time/60)/1.4 ; // assume 70mph max speed
    if(carData.bus){
      var miles = (time/60)/2.2
    }
    spokes.features.push(destination(centerPt, miles, 180, 'miles'));
    spokes.features.push(destination(centerPt, miles, 0, 'miles'));
    spokes.features.push(destination(centerPt, miles, 90, 'miles'));
    spokes.features.push(destination(centerPt, miles, -90, 'miles'));

    var bbox = extent(spokes);

    //compute destination grid

    var targets = grid(bbox, resolution);

    console.log(targets.features.length)
    var routes = featureCollection([]);
    var destinations = featureCollection([]);
    var i = 0;
    var routedNum = 0;

    var gridData = [];


    getNext(i)
    var counter = 0 ; 
    function getNext(i){
        if(destinations.length >= targets.length){
            return
        }
        if(i < targets.features.length) {
            var query = {
                coordinates: [
                    [
                      center[1], center[0]
                    ],
                    [
                      targets.features[i].geometry.coordinates[1], targets.features[i].geometry.coordinates[0]
                    ]
                ]
            };

            osrm.route(query, function(err, res){
                i++;
                if(err) console.log(err)
                if(err) return done(err)
                else if (!res || !res.route_summary) {
                    destinations.features.push({
                        type: 'Feature',
                        properties: {
                            eta: time+100
                            //,dist: 500
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [query.coordinates[1][1], query.coordinates[1][0]]
                        }
                    });
                } else {
                   


                    if (getTripCost(res.route_summary.total_distance, carData, res.route_summary.total_time) <= ((maxCost/5.0)*1)  ){
                    
                        gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:5 })


                    } else if (getTripCost(res.route_summary.total_distance, carData, res.route_summary.total_time)  <= ((maxCost/5.0)*2) ){
                               gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:4 })

                    }else if (getTripCost(res.route_summary.total_distance, carData, res.route_summary.total_time)<= ((maxCost/5.0)*3) ){
                               gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:3 })

                    }else if (getTripCost(res.route_summary.total_distance, carData, res.route_summary.total_time) <= ((maxCost/5.0)*4) ){
                               gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:2 })

                    } else {
                               gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:-10 })

                    }
    
                    destinations.features.push({
                        type: 'Feature',
                        properties: {
                            eta: res.route_summary.total_time,
                            dist: res.route_summary.total_distance
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [res.via_points[1][1], res.via_points[1][0]]
                        }
                        });
                    routes.features.push(decode(res));
                }
                getNext(i);
            });
        } else {
            var xmin = bbox[0];
            var xmax = bbox[2];
            var interval = (xmax - xmin) / resolution;

            // var line = isolines(destinations, 'eta', resolution, [time]);
            var outData = { gridHeight: resolution + 1 , gridWidth: resolution + 1 , y0: gridData[0].y, x0: gridData[1].x, dx: -interval , dy: -interval, position:gridData }
            // console.log(gridData)
            return done(null, outData);
        }
    }
}

function decode (res) {
    var route = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: polylineDecode(res.route_geometry)
        },
        properties: {
            eta: res.route_summary.total_time,
            dist: res.route_summary.total_distance
        }
    };
    route.geometry.coordinates = route.geometry.coordinates.map(function(c){
        var lon = c[1] * 0.1;
        var lat = c[0] * 0.1;
        return [lon, lat];
    });
    return route;
}


function getTripCost(length, carData, time){
  //cpg =: cost per gallon 
 
 if(carData.bus){
var threshold = 60 * 15; 


  var t_cost = (time/ threshold) * 1.12;

 } else {
  var cpg = 1/0.264172 * 0.89;
  var com_mpg = +carData["Epa Combined Mpg"] * 1609.34; // TODO: change to meters per gallon 
  var city_mpg = +carData["Epa City Mpg"] * 1609.34;
  var high_mpg = +carData["Epa Highway Mpg"] * 1609.34;
  var t_cost = 0;
  if(com_mpg){
    t_cost = cpg * (length /com_mpg);
  } else if(city_mpg){
    t_cost = cpg * (length /city_mpg);
  } else {
    t_cost = 25 * (length /city_mpg);
  }



}


  return t_cost

}

exports.index = function(req, res) {
var resolution = 25; // sample resolution
var network = "null" ; 
var time = 3600; // 300 second drivetime (5 minutes)
var location = [req.body.coordinate.x ,req.body.coordinate.y ]; // center point
var out = [];
var cal = [300,900,900,1200,1500];
var fuelData ;
var maxCost = req.body.cost; 
// assumung 40mpg
var time = ((30 * (maxCost / (1/0.264172 * 0.86))) / 60) *60 *60 ;


if(!req.body.bus){

    client.getEquipmentDetailsByStyle({styleId : req.body.id }, function (err, data){
   var carInfo = data.equipment.filter(function (eData){
      return eData.name === 'Specifications' || eData.name ===  'Engine';
   })

   fuelData = carInfo.reduce(function (dataOb, item){
    if(item.name === 'Specifications'){
      item.attributes.filter(function (attr){
        return attr.name === "Epa Combined Mpg" || attr.name === "Epa City Mpg" || attr.name === "Epa Highway Mpg"
      }).forEach(function (attr){
        dataOb[attr.name] = attr.value ;
      })
    } else {
      dataOb["fuelType"] = item["fuelType"]
    }
    return dataOb;

   }, {})


getPolygons(location, 3000, resolution, network , fuelData, maxCost, function(err, drivetime) {
  if(err) throw err;
  out.push((drivetime))
  // a geojson linestring
  res.send(JSON.stringify(out))
  //res.end('end')
});



  })

        
} else {
  fuelData = {bus: true }

  getPolygons(location, 3000, resolution, network , fuelData, maxCost, function(err, drivetime) {
  if(err) throw err;
  out.push((drivetime))
  // a geojson linestring
  res.send(JSON.stringify(out))
  //res.end('end')
});


}




};


exports.getMakes = function (req, res){



  client.getAllMakes({}, function (err, data){
    res.send(JSON.stringify(data))
   //  client.getEquipmentDetailsByStyle({styleId : 101384830 }, function (err, res){
   // var carInfo = res.equipment.filter(function (eData){
   //    return eData.name === 'Specifications' || eData.name ===  'Engine';
   // })

   // var fuelData = carInfo.reduce(function (dataOb, item){
   //  if(item.name === 'Specifications'){
   //    item.attributes.filter(function (attr){
   //      return attr.name === "Epa Combined Mpg" || attr.name === "Epa City Mpg" || attr.name === "Epa Highway Mpg"
   //    }).forEach(function (attr){
   //      dataOb[attr.name] = attr.value ;
   //    })
   //  } else {
   //    dataOb["fuelType"] = item["fuelType"]
   //  }
   //  return dataOb;

   // }, {})

   // console.log(fuelData)

  })


}

exports.getCars = function (req, res){

  var car = req.body;
  console.log(car)
   client.getModelDetails( car , function (err, data){
    res.send(JSON.stringify(data));

   })

}





  //   client.getEquipmentDetailsByStyle({styleId : 200721614 }, function (err, res){
  //  var carInfo = res.equipment.filter(function (eData){
  //     return eData.name === 'Specifications' || eData.name ===  'Engine';
  //  })

  //  var fuelData = carInfo.reduce(function (dataOb, item){
  //   if(item.name === 'Specifications'){
  //     item.attributes.filter(function (attr){
  //       return attr.name === "Epa Combined Mpg" || attr.name === "Epa City Mpg" || attr.name === "Epa Highway Mpg"
  //     }).forEach(function (attr){
  //       dataOb[attr.name] = attr.value ;
  //     })
  //   } else {
  //     dataOb["fuelType"] = item["fuelType"]
  //   }
  //   return dataOb;

  //  }, {})

  //  console.log(fuelData)

  // })




