angular.module('application.services', ['ngResource'])

    .factory('ServerSession', ['$http', function ($http) {
        var ServerSession = {};

        ServerSession.getModels = function() {
            return $http.get('http://ec2-54-165-60-76.compute-1.amazonaws.com/med_models');
        };

        ServerSession.getModel = function(id) {
            return $http.get('http://ec2-54-165-60-76.compute-1.amazonaws.com/med_model/' + id);
        };

        ServerSession.getModelInfo = function(id) {
            return $http.get('http://ec2-54-165-60-76.compute-1.amazonaws.com/get_model/' + id);
        };

        return ServerSession;
    }])

    .factory('ServerSessionURL', ['$http', function ($http) {
        var ServerSession = {};

        ServerSession.getModels = function() {
            //return $http.get('http://localhost:8080/med_models');
            return 'http://ec2-54-165-60-76.compute-1.amazonaws.com/med_models';
        };

        ServerSession.getModel = function(id) {
            //return $http.get('http://localhost:8080/med_model/' + id);
            return 'http://ec2-54-165-60-76.compute-1.amazonaws.com/med_model/';
        };

        ServerSession.getModelInfo = function(id) {
            //return $http.get('http://localhost:8080/get_model/' + id);
            return 'http://ec2-54-165-60-76.compute-1.amazonaws.com/get_model/';
        };

        return ServerSession;
    }])

    .service('LocalStorage', ['$http', function ($http) {
        var models ={
            msg: "AHAHAHHA",
            models: {}
        };
        var download = function(fname, obj, url) {
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
                                        var localurl = entry.toURL();
                                        console.log(localurl);
                                        $http.get(localurl)
                                            .success(function (retmodels) {
                                                obj.msg = localurl;
                                                obj.models = retmodels;
                                            })
                                            .error(function (error) {
                                                //$scope.msg = 'Unable to download models: ' + error.message;
                                                load(fname, obj);
                                            })
                                            .finally(function() {
                                                console.log(models.models);
                                                // Stop the ion-refresher from spinning
                                                $scope.$broadcast('scroll.refreshComplete');
                                            });
                                    },
                                    function(error) {
                                        load(fname, obj);
                                        console.log("Download Error Source -> " + error.source);
                                    },
                                    false,
                                    null
                                );
                            }, 
                            function() {
                                console.log("Get file failed");
                            }
                        );
                    }
                );
            },
            function() {
                console.log("Request for filesystem failed");
            });
        };

        var load = function(fname, obj) {
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
                                url = fe.toURL();

                                $http.get(url)
                                    .success(function (models) {
                                        obj.models = models;
                                    })
                                    .error(function (error) {
                                        //$scope.msg = 'Unable to load models: ' + error.message;
                                        alert('Unable to load models: ' + error.message);
                                    })
                                    .finally(function() {
                                        // Stop the ion-refresher from spinning
                                        //$scope.$broadcast('scroll.refreshComplete');
                                    });
                            }, 
                            function(error) {
                                console.log("Error getting file: " + error);
                            }
                        );
                    }
                );
            },
            function() {
                console.log("Error requesting filesystem");
            });
        };

        //download('test.js', models, 'http://ec2-54-165-60-76.compute-1.amazonaws.com/med_models');
        //load('test.js', models);
        console.log("222");
        console.log(models.msg);
        console.log(models.models);
        return {
            models: models,
            load: load,
            download: download
        };
    }])

    .service('PlotData', function () {
        var eqn;
        var current_point;
        var setEquation = function(fn){ eqn = fn; };
        var setPoint = function(point){ current_point = point; };
        var getEquation = function(){ return eqn; };
        var getPoint = function(){ return current_point; }

        return {
            setEquation: setEquation,
            getEquation: getEquation,
            setPoint: setPoint,
            getPoint: getPoint
        };
    });

