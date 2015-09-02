'use strict';

angular.module('costlymapApp')
  .controller('MainCtrl', function($scope, $http) {
    $scope.awesomeThings = [];

      var map = L.map('map').setView([-23.539278, -46.648171  ], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([-23.539278, -46.648171 ]).addTo(map)
        .bindPopup('Current point of interest!')
        .openPopup();


setTimeout(function() {

    $http.get('/api/osms').then(function(response) {
    	     L.geoJson(response.data).addTo(map);

      console.log(response.data)
    });

}, 1000);



  });
