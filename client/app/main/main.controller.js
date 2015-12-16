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
  var temp_labels = [];
  $http.get('https://www.quandl.com/api/v3/datasets/WIKI/'+item+'/metadata.json?api_key=RHczh31e48Xd6yRtSHvS')
  .success(function (metadata) {
  $http.get('https://www.quandl.com/api/v3/datasets/WIKI/'+item+'/data.json?start_date=2015-01-01&order=asc&collapse=weekly&column_index=4&api_key=RHczh31e48Xd6yRtSHvS')
  .success(function(data) {
   // received data since start of 2015

    var stock_prices = [];
    data.dataset_data.data.forEach(function (element, index, array) {
      var str= element[0];
      var dateArray = str.split('-');
      var newDate = dateArray[1]+"/"+dateArray[2];
      $scope.year = dateArray[0];

      temp_labels.push(newDate);
      stock_prices.push(element[1]);
    });
    $scope.data.push(stock_prices);
    $scope.labels = temp_labels;
    var str = metadata.dataset.name;
    str = str.substr(0,str.indexOf('(',0)); // extract out just the company name

    $scope.series.push(str);
    $scope.symbols.push(item);

  });
});
 };


    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      if (_.find($scope.awesomeThings, function(elt) { return elt.name==$scope.newThing;}) != undefined) {
        alert("Symbol " + $scope.newThing + " already exists");
        $scope.newThing = '';
        return;
      }
  //      https://www.quandl.com/api/v3/datasets/WIKI/AAPL/data.json?start_date=2015-01-01&order=asc&column_index=4&api_key=RHczh31e48Xd6yRtSHvS
  $http.get('https://www.quandl.com/api/v3/datasets/WIKI/'+$scope.newThing+'/metadata.json?api_key=RHczh31e48Xd6yRtSHvS')
  .success(function (metadata) {
  // check for existence plus other metadata
  $http.post('/api/things', { name: $scope.newThing});
  loadData($scope.newThing);
  $scope.newThing = '';
  }).error(function (err) {
    alert("No such stock symbol " + item);
    $scope.newThing = '';

  });
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
