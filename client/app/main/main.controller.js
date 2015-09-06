'use strict';

angular.module('costlymapApp')
  .controller('MainCtrl', function($scope, $http, $timeout, $mdToast) {
    $scope.awesomeThings = [];
    $scope.cost = 0;

  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };



  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };


 $scope.showSimpleToast = function() {
    $mdToast.show(
      $mdToast.simple()
        .content('Simple Toast!')
        .position($scope.getToastPosition())
        .hideDelay(3000)
    );
}

 


 $scope.userModel = '';
        $scope.models = [{name :'Honda'},{name :'BMW'}];

$scope.myFunction = function (data){
	console.log(data)
}

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
        min: 0

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

  // Create a map object with the OpenStreetMaps base layer centered in Sao Paulo 
  var map = geo.map({
    node: '#map',
    center: {
      x:  -46.648171,
      y: -23.539278
    },
    zoom: 11
  });

  // Add the osm layer
  map.createLayer(
    'osm'
  );

  // Create a gl feature layer for cost contours
  var vglLayer = map.createLayer(
    'feature',
    {
      renderer: 'vgl'
    }
  );
 


// console.log(map.interactor()._disconnectEvents())

 var layer = map.createLayer('feature', {'renderer' : 'd3'});

function getPolygons(coordinate){
	vglLayer.clear()

	$http.post('/api/osms', {coordinate: coordinate }).then(function(response) {

	    var data = (response.data[0]);
		console.log(vglLayer.visible() )
	    var contour = makeContour(data, vglLayer);
	  	map.draw();

    });
}


  // Legend Creation
  var ui = map.createLayer('ui');
      ui.createWidget('slider');

vglLayer.geoOn(geo.event.mouseclick,function (data){
	console.log(data)


    $scope.currentPoint = [{
      x:  data.geo.x,
      y: data.geo.y
    }]
 	
 	getPolygons({
      x:  data.geo.x,
      y: data.geo.y
    })

    var dot = layer.createFeature('point')
    .data($scope.currentPoint)
    .style('radius', 5)
    .style('fillColor', function () { return 'red'; })
    .position(function (d) { return d; });

})
 console.log(map)

  });
