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

    .factory('OtherServerSession', ['$http', function ($http) {
        var ServerSession = {};

        ServerSession.getModels = function() {
            return $http.get('http://localhost:8080/med_models');
        };

        ServerSession.getModel = function(id) {
            return $http.get('http://localhost:8080/med_model/' + id);
        };

        ServerSession.getModelInfo = function(id) {
            return $http.get('http://localhost:8080/get_model/' + id);
        };

        return ServerSession;
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

