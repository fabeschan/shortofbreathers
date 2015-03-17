angular.module('application.controllers', [])

    .controller('ModelListCtrl', ['$scope', 'ServerSession', function ($scope, ServerSession) {

        $scope.status;
        $scope.models;
        getModels();
        function getModels () {
            ServerSession.getModels ()
                .success(function (models) {
                    $scope.models = models;
                })
                .error(function (error) {
                    $scope.status = 'Unable to load models: ' + error.message;
                });
        }
    }])

    .controller('LoadCtrl', ['$scope', 'ServerSession', 'PlotData', '$stateParams',
        function ($scope, ServerSession, PlotData, $routeParams) {
            $scope.models;
            var joinFunc;
            $scope.message = "No message";

            getModels();

            function getModels () {
                ServerSession.getModels ()
                    .success(function (models) {
                        console.log("getModels");
                        $scope.models = models;
                        getModelInfo($routeParams.param);
                    })
                    .error(function (error) { $scope.status = 'Unable to load models: ' + error.message; });
            }

            function getModelInfo (id) {
                ServerSession.getModelInfo (id)
                    .success(function (modelinfo) {
                        console.log("getModelinfo");
                        $scope.model_name = $scope.models[id].name;
                        $scope.patient = modelinfo.patient;
                        $scope.schema = modelinfo.schema;
                        $scope.lookup = modelinfo.lookup;

                        joinFunc = modelinfo.join;
                        if (modelinfo.lookup !== undefined && modelinfo.lookup.plotOutput !== undefined){
                            plotEqn = eval('(function(probability) {'+$scope.lookup.plotOutput+'})');
                            PlotData.setEquation(plotEqn);
                            $scope.hasPlot = true;
                        }
                        else { $scope.hasPlot = false; }
                        $scope.join();
                    })
                    .error(function (error) { console.log('Unable to load models: ' + error.message); });
            }

            $scope.bracket = function(num, obj){
                var k = [];
                for (o in obj) k.push(obj[o].index);
                k.sort(function(a, b) { return a < b ? 1 : -1});
                for (i=0; i<k.length;i++){
                    if (num >= k[i]) return obj[i];
                }
            };
            
            $scope.join = function () {
                eval(joinFunc);
                console.log($scope.perc_rule);
                $scope.probability = $scope.patient['probability'];
                console.log("Evaluated Join Function");
                PlotData.setPoint([$scope.patient['probability'], $scope.output_value[0]]);
            };
    }])

    .controller('PlotCtrl', ['$scope', 'PlotData', '$ionicNavBarDelegate',
        function($scope, PlotData, $ionicNavBarDelegate) {
            //var eqn = PlotData.getEquation();
            //PlotData.setEquation(eqn);

            if (!PlotData.getEquation()){
                console.log("PlotData.getEquation not defined! Going back");
                //$ionicNavBarDelegate.back();
            }
            else {
                $scope.dataset = [
                    { data: [], yaxis: 1, label: "posterior", lines: { show: true }},
                    { data: [], color: 'green',  points: {symbol: "circle", fillColor: "#058DC7",  show: true } }
                ];


                $scope.options = {
                    legend: {
                        container: "#legend",
                        show: true
                    },
                };

                for (var i = 1; i <= 100; i += 1) {
                    $scope.dataset[0].data.push([i, PlotData.getEquation()(i)]);
                }
                $scope.dataset[1].data.push(PlotData.getPoint());
                var plot = $.plot($("#placeholder"), [$scope.dataset[0], $scope.dataset[1]], $scope.options);

            }
    }])

    .controller('ManageCtrl', ['$scope', 'ServerSession', 
        function ($scope, ServerSession) {
            $scope.status;
            $scope.models;
            getModels();
            function getModels () {
                ServerSession.getModels ()
                    .success(function (models) {
                        $scope.models = models;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load models: ' + error.message;
                    });
            }
    }]);
