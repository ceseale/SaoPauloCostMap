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


   function getPolygons(center, time, resolution, network, done) {

    // compute bbox
    // bbox should go out 1.4 miles in each direction for each minute
    // this will account for a driver going a bit above the max safe speed

    var centerPt = point([center[0], center[1]]);
    var spokes = featureCollection([])
    var miles = (time/60) /2; // assume 70mph max speed
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
                   


                    if (res.route_summary.total_time <= 400){
                    
                        gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:5 })


                    } else if (res.route_summary.total_time <= 600){
                               gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:4 })

                    }else if (res.route_summary.total_time <= 800){
                               gridData.push({x: query.coordinates[1][1],
                     y:  query.coordinates[1][0],
                      z:3 })

                    }else if (res.route_summary.total_time <= 1000){
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


exports.index = function(req, res) {
var resolution = 25; // sample resolution
var network = "null" ; 
var time = 3600; // 300 second drivetime (5 minutes)
var location = [req.body.coordinate.x ,req.body.coordinate.y ]; // center point
var out = [];
var cal = [300,900,900,1200,1500];
console.log(req.body)

        
    console.log(location)
getPolygons(location, 900, resolution, network , function(err, drivetime) {
  if(err) throw err;
  out.push((drivetime))
  // a geojson linestring
  res.send(JSON.stringify(out))
  //res.end('end')
});

};


  // var EdmundsClient = require('node-edmunds-api');
  // var client = new EdmundsClient({ apiKey:  });
  // console.log(client.getAllMakes({}, function (err, res){
  // 	console.log(res)
  // }))

