(function(angular) {
    'use strict';

    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            WeatherService,
            MapService,
            HueService,
            CalendarService,
            XKCDService,
            GiphyService,
            TrafficService,
            $scope, $timeout, $interval) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Zeg "Wat kan ik zeggen?" om een lijst van commands te zien...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

        //Update the time
        function updateTime(){
            $scope.date = new Date();
        }

        // Reset the command text
        var restCommand = function(){
          $scope.interimResult = DEFAULT_COMMAND_TEXT;
        }

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                console.log("Geoposition", geoposition);
                $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
            });
            restCommand();

            var refreshMirrorData = function() {
                //Get our location and then get the weather for our location
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentForcast = WeatherService.currentForcast();
                        $scope.weeklyForcast = WeatherService.weeklyForcast();
                        $scope.hourlyForcast = WeatherService.hourlyForcast();
                        console.log("Current", $scope.currentForcast);
                        console.log("Weekly", $scope.weeklyForcast);
                        console.log("Hourly", $scope.hourlyForcast);
                    });
                }, function(error){
                    console.log(error);
                });

                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });

                $scope.greeting = config.greeting[Math.floor(Math.random() * config.greeting.length)];
            };

            refreshMirrorData();
            $interval(refreshMirrorData, 3600000);

            var refreshTrafficData = function() {
                TrafficService.getTravelDuration().then(function(durationTraffic) {
                    console.log("Traffic", durationTraffic);
                    $scope.traffic = {
                        destination:config.traffic.name,
                        hours : durationTraffic.hours(),
                        minutes : durationTraffic.minutes()
                    };
                }, function(error){
                    $scope.traffic = {error: error};
                });
            };

            refreshTrafficData();
            $interval(refreshTrafficData, config.traffic.reload_interval * 60000);

            var defaultView = function() {
                console.debug("Ok, gaan naar beginscherm...");
                $scope.focus = "default";
            }

			// List commands
            AnnyangService.addCommand('Wat kan ik zeggen', function() {
                console.debug("Hier een lijst van commandos...");
                console.log(AnnyangService.commands);
                $scope.focus = "commands";
            });

            // Go back to default view
            AnnyangService.addCommand('Beginscherm', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Ga slapen', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            AnnyangService.addCommand('Wordt wakker', function() {
				$scope.focus = "default";
			});

            // Hide everything and "sleep"
            AnnyangService.addCommand('Toon debug informatie', function() {
                console.debug("Boop Boop. Toont debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Toon kaart', function() {
                console.debug("Ga je op avontuur?");
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
             });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Toon (mij) een kaart van *location', function(location) {
                console.debug("Haalt kaart op van ", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            AnnyangService.addCommand('(kaart) inzoomen', function() {
                console.debug("Zoooooooom!!!");
                $scope.map = MapService.zoomIn();
            });

            AnnyangService.addCommand('(kaart) uitzoomen', function() {
                console.debug("Moooooooooz!!!");
                $scope.map = MapService.zoomOut();
            });

            AnnyangService.addCommand('(kaart) inzoomen (naar) *value', function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            AnnyangService.addCommand('(kaart) reset zoom', function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Search images
            AnnyangService.addCommand('Toon mij *term', function(term) {
                console.debug("Toont", term);
            });

             // Change name
            AnnyangService.addCommand('Mijn naam is *name', function(name) {
                console.debug("Hey ", name, " leuk je te ontmoeten");
				$scope.user.name = name;
            });

            // Set a reminder
            AnnyangService.addCommand('Herinner mij om', function(task) {
                console.debug("Ik help je herinneren om", task);
            });

            // Clear reminders
            AnnyangService.addCommand('Wis todo lijst', function() {
                console.debug("Todo lijst wissen");
            });

            // Check the time
            AnnyangService.addCommand('Hoe laat is het', function(task) {
                 console.debug("Het is", moment().format('H [uur] m'));
                 _this.clearResults();
            });

            // Turn lights off
            AnnyangService.addCommand('(doe) (de) licht(en) :state (en maak ze) *action', function(state, action) {
                HueService.performUpdate(state + " " + action);
            });

            //Show giphy image
            AnnyangService.addCommand('gif *img', function(img) {
                GiphyService.init(img).then(function(){
                    $scope.gifimg = GiphyService.giphyImg();
                    $scope.focus = "gif";
                });
            });

            // Show xkcd comic
            AnnyangService.addCommand('Toon xkcd', function(state, action) {
                console.debug("Fetching a comic for you.");
                XKCDService.getXKCD().then(function(data){
                    $scope.xkcd = data.img;
                    $scope.focus = "xkcd";
                });
            });

            var resetCommandTimeout;
            //Track when the Annyang is listening to us
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            }, function(interimResult){
                $scope.interimResult = interimResult;
                $timeout.cancel(resetCommandTimeout);
            }, function(result){
                $scope.interimResult = result[0];
                resetCommandTimeout = $timeout(restCommand, 5000);
            });
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));
