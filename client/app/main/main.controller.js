/*** Quandl API KEY
RHczh31e48Xd6yRtSHvS
***/

'use strict';

angular.module('kinleyStockmarketApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    /** Init these guys knowing they may be prefilled by init data from get **/
    $scope.series = [];
    $scope.labels = [];
    $scope.data = [];
    $scope.symbols = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
      _.forEach($scope.awesomeThings, function(item) { loadData(item.name);});
    });


/** Gathers the data from quandl for stock symbol ITEM and inserts 
  data appropriately ot be used for building the graph */
    function loadData(item) {
$http.get('https://www.quandl.com/api/v3/datasets/WIKI/'+item+'/metadata.json?api_key=RHczh31e48Xd6yRtSHvS')
.success(function (metadata) {
  // check for existence plus other metadata
  var temp_labels = [];
  $http.get('https://www.quandl.com/api/v3/datasets/WIKI/'+item+'/data.json?start_date=2015-01-01&order=asc&collapse=weekly&column_index=4&api_key=RHczh31e48Xd6yRtSHvS').success(function(data) {
   // received data since start of 2015

    var stock_prices = [];
    data.dataset_data.data.forEach(function (element, index, array) {
      temp_labels.push(element[0]);
      stock_prices.push(element[1]);
    });
    $scope.data.push(stock_prices);
    $scope.labels = temp_labels;
    $scope.series.push(metadata.dataset.name);
    $scope.symbols.push(item);

    });
  }).error(function (err) {
    alert("No such stock symbol " + item);
    $scope.newThing = '';

  });


    }
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      if (_.find($scope.symbols, function(elt) { return elt==$scope.newThing;}) != undefined) {
        alert("Symbol " + $scope.newThing + " already exists");
        $scope.newThing = '';
        return;
      }
//      https://www.quandl.com/api/v3/datasets/WIKI/AAPL/data.json?start_date=2015-01-01&order=asc&column_index=4&api_key=RHczh31e48Xd6yRtSHvS
      $http.post('/api/things', { name: $scope.newThing });
      loadData($scope.newThing);
      $scope.newThing = '';

    };


    /** Removes an item up for deletion from  the graph **/
    function removeGraph(item) {

      var pos = _.findIndex($scope.symbols, function(elt) {return elt ==  item;});
      _.pullAt($scope.series, pos);
      _.pullAt($scope.data, pos);
      _.pullAt($scope.symbols,pos);
    }
    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
      removeGraph(thing.name);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
/*
$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  */
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  });
