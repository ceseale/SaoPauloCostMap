'use strict';

angular.module('costlymapApp')
  .controller('MainCtrl', function($scope, $http) {
    $scope.awesomeThings = [];

    //   var map = L.map('map').setView([-23.539278, -46.648171  ], 10);


    // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);


  // Define a function we will use to generate contours.
  function makeContour(data, layer) {


    /* There are two example data sets.  One has a position array which
     * consists of objects each with x, y, z values.  The other has a values
     * array which just has our contour values. */




    var contour = layer.createFeature('contour')
      .data(data.position || data.values)
      .style({
        opacity: 0.5
      })
      .contour({
        gridWidth: data.gridWidth,
        gridHeight: data.gridHeight,
        stepped: true,
         rangeValues: [0,-1,5],
        /* The color range doesn't have to be linear:
        rangeValues: [0, 25, 50, 75, 100, 125, 250, 500, 750, 2000],
         */
        /* Or, you could plot iso-contour lines using a varying opacity:
        rangeValues: [100, 100, 200, 200, 300, 300, 400, 400, 500, 500],
        opacityRange: [1, 0, 1, 0, 1, 0, 1, 0, 1],
         */
        /* You can make smooth contours instead of stepped contours:
        stepped: false,
         */
        min: 0
      });
    if (data.position) {
      contour
      .position(function (d) { return {x: d.x, y: d.y, z: d.z}; })
      .style({
        value: function (d) { return d.z > -9999 ? d.z : null; }
        /* You can get better contours if you set a minimum value and set
         * sea locations to a small negative number:
        value: function (d) { return d.z > -9999 ? d.z : -10; }
         */
      });
    } else {
      contour
      .style({
        value: function (d) { return d > -9999 ? d : null; }
      })
      .contour({
        /* The geometry can be specified using 0-point coordinates and deltas
         * since it is a regular grid. */
        x0: data.x0, y0: data.y0, dx: data.dx, dy: data.dy
      });
    }
    return contour;
  }  

  // Create a map object with the OpenStreetMaps base layer.
  var map = geo.map({
    node: '#map',
    center: {
    	 //   x: -157.965,
      // y: 21.482
      x:  -46.648171,
      y: -23.539278
    },
    zoom: 11
  });

  // Add the osm layer
  map.createLayer(
    'osm'
  );

  // Create a gl feature layer
  var vglLayer = map.createLayer(
    'feature',
    {
      renderer: 'vgl'
    }
  );
 





  // $.ajax({
  //   url: 'data/data.json',
  //   success: function (data) {
  //   	console.log(data)

  //     var contour = makeContour(data, vglLayer);
  //     // Draw the map
  //     map.draw();
  //     /* After 10 second, load a denser data set */
  //     window.setTimeout(function () {
  //       $.ajax({
  //         url: 'data_dense.json',
  //         success: function (data) {
  //           vglLayer.deleteFeature(contour);
  //           contour = makeContour(data, vglLayer, contour);
  //           map.draw();
  //         }
  //       });
  //     }, 10000);
  //   },
  //   error: function (error){
  //   	console.log(JSON.parse(error.responseText))
  //   }




  // });


//     L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);

//     L.marker([-23.539278, -46.648171 ]).addTo(map)
//         .bindPopup('Current point of interest!')
//         .openPopup();
// var myStyle = {
// 	"stroke-linejoin" :"round",
//     fill: "#ff7800",
//     "opacity": 1
// };
console.log(data.position.length)



    $http.get('/api/osms').then(function(response) {
    var data = (response.data[0]);


console.log(vglLayer.visible() )
 
        var contour = makeContour(data, vglLayer);
  		map.draw();


vglLayer.clear()

		  //       var contour = makeContour(data, vglLayer);
  		// map.draw();
    });



  });
