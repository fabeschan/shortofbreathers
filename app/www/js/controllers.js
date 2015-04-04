angular.module('application.controllers', [])

    .controller('ModelListCtrl', ['$scope', 'ServerSessionURL', '$ionicLoading', '$http', function ($scope, ServerSession, $ionicLoading, $http) {

        $scope.status;
        $scope.models;
        //getModels();
        //$scope.doRefresh = getModels;
        //function getModels () {
        //    ServerSession.getModels ()
        //        .success(function (models) {
        //            $scope.models = models;
        //        })
        //        .error(function (error) {
        //            $scope.status = 'Unable to load models: ' + error.message;
        //        })
        //        .finally(function() {
        //            // Stop the ion-refresher from spinning
        //            $scope.$broadcast('scroll.refreshComplete');
        //        });
        //}

        $scope.download = function(fname, objname, url) {
            //$ionicLoading.show({
            //  template: 'Loading...'
            //});
            $scope.fname = fname;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                fs.root.getDirectory(
                    "MediRisk",
                    {
                        create: true
                    },
                    function(dirEntry) {
                        dirEntry.getFile(
                            fname, 
                            {
                                create: true, 
                                exclusive: false
                            }, 
                            function gotFileEntry(fe) {
                                var p = fe.toURL();
                                fe.remove();
                                ft = new FileTransfer();
                                ft.download(
                                    encodeURI(url),
                                    p,
                                    function(entry) {
                                        //$ionicLoading.hide();
                                        $scope[objname] = entry.toURL();

                                        $http.get($scope[objname])
                                            .success(function (models) {
                                                $scope[objname] = models;
                                            })
                                            .error(function (error) {
                                                $scope.msg = 'Unable to download models: ' + error.message;
                                                $scope.load(fname, urlname);
                                            })
                                            .finally(function() {
                                                // Stop the ion-refresher from spinning
                                                $scope.$broadcast('scroll.refreshComplete');
                                            });
                                    },
                                    function(error) {
                                        //$ionicLoading.hide();
                                        alert("Download Error Source -> " + error.source);
                                    },
                                    false,
                                    null
                                );
                            }, 
                            function() {
                                //$ionicLoading.hide();
                                console.log("Get file failed");
                            }
                        );
                    }
                );
            },
            function() {
                //$ionicLoading.hide();
                console.log("Request for filesystem failed");
            });
        }

        $scope.load = function(fname, urlname) {
            //$ionicLoading.show({
            //  template: 'Loading...'
            //});
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                fs.root.getDirectory(
                    "MediRisk",
                    {
                        create: false
                    },
                    function(dirEntry) {
                        dirEntry.getFile(
                            fname, 
                            {
                                create: false, 
                                exclusive: false
                            }, 
                            function gotFileEntry(fe) {
                                //$ionicLoading.hide();
                                $scope[urlname] = fe.toURL();

                                $http.get($scope[urlname])
                                    .success(function (models) {
                                        $scope[urlname] = models;
                                    })
                                    .error(function (error) {
                                        $scope.msg = 'Unable to load models: ' + error.message;
                                    })
                                    .finally(function() {
                                        // Stop the ion-refresher from spinning
                                        $scope.$broadcast('scroll.refreshComplete');
                                    });
                            }, 
                            function(error) {
                                //$ionicLoading.hide();
                                console.log("Error getting file");
                            }
                        );
                    }
                );
            },
            function() {
                //$ionicLoading.hide();
                console.log("Error requesting filesystem");
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
                        $scope.models = models;
                        getModelInfo($routeParams.param);
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load models: ' + error.message;
                    })
                    .finally(function() {
                        // Stop the ion-refresher from spinning
                        $scope.$broadcast('scroll.refreshComplete');
                    });
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

            $scope.doRefresh = getModels;

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
