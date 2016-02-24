(function() {
    'use strict';

    function HueService($http) {
        var service = {};

        //Updates a group of Hue lights (Assumes that one group is configured)
        //You can change the group to 0 to perform the updates to all lights
        service.performUpdate = function(spokenWords) {
            //deturmine the updates that we need to perform to the lights
            var update = deturmineUpdates(spokenWords.toLowerCase().split(" "));
            //Parse the update string and see what actions we need to perform
            console.log(update);

            $http.put('http://' + config.hue.ip + '/api/' + config.hue.uername + '/groups/' + config.hue.group + '/action', update)
            .success(function (data, status, headers) {
                console.log(data);
            })
        }

        //Detect any kind of target color
        function deturmineUpdates(spokenWords){
            console.log("Gesproken Woorden:", spokenWords)
            var update = {};

            update["transitiontime"] = 10;

            for(var i = 0; i <= spokenWords.length; i++){
                console.log("Controleert woord:", spokenWords[i]);

                //Check for color updates
                if(spokenWords[i] == 'rood' || spokenWords[i] == 'reed' || spokenWords[i] == 'read'){
                    update["xy"] = [0.674,0.322];
                } else if(spokenWords[i] == 'donker groen'){
                    update["xy"] = [0.408,0.517];
                } else if(spokenWords[i] == 'groen'){
                    update["xy"] = [0.408,0.517];
                } else if(spokenWords[i] == 'blauw' || spokenWords[i] == 'blow'){
                    update["xy"] = [0.168,0.041];
                } else if(spokenWords[i] == 'geel'){
                    update["xy"] = [0.4317,0.4996];
                } else if(spokenWords[i] == 'oranje'){
                    update["xy"] = [0.5562,0.4084];
                } else if(spokenWords[i] == 'roze'){
                    update["xy"] = [0.3824,0.1601];
                } else if(spokenWords[i] == 'paars'){
                    update["xy"] = [0.2725,0.1096];
                } else if(spokenWords[i] == 'wit' || spokenWords[i] == 'white' || spokenWords[i] == 'wight'){
                    update["xy"] = [0.3227,0.329];
                } else if(spokenWords[i] == 'film' || spokenWords[i] == 'cinema' || spokenWords[i] == 'Netflix'){
                    update["xy"] = [0.3227,0.329];
                    update["sat"] = 0;
                    update["bri"] = 15;
                } else if(spokenWords[i] == 'colorloop' || spokenWords[i] == 'loop' || spokenWords[i] == 'color-loop'){
                    update["effect"] = "colorloop";
                } else if(spokenWords[i] == 'stop'){
                    update["effect"] = "none";
                    update["xy"] = [0.3227,0.329];
                    update["sat"] = 0;
                    update["bri"] = 255;
                }

                //check for a brightness adjustment
                if(spokenWords[i] == 'feller' || spokenWords[i] == 'lichter' || spokenWords[i] == 'meer'){
                    update["bri_inc"] = 51; // 20%
                } else if(spokenWords[i] == 'dimmen' || spokenWords[i] == 'minder' || spokenWords[i] == 'donkerder'){
                    update["bri_inc"] = -51; // 20%
                } else if(spokenWords[i] == '100%' || spokenWords[i] == 'intens' || spokenWords[i] == 'max' || spokenWords[i] == 'maximum'){
                    update["bri"] = 254;
                } else if(spokenWords[i] == '10%'){
                    update["bri"] = 26;
                } else if(spokenWords[i] == '20%'){
                    update["bri"] = 51;
                } else if(spokenWords[i] == '25%'){
                    update["bri"] = 64;
                } else if(spokenWords[i] == '30%'){
                    update["bri"] = 77;
                } else if(spokenWords[i] == '40%'){
                    update["bri"] = 102;
                } else if(spokenWords[i] == '50%'){
                    update["bri"] = 128;
                } else if(spokenWords[i] == '60%'){
                    update["bri"] = 153;
                } else if(spokenWords[i] == '70%'){
                    update["bri"] = 179;
                } else if(spokenWords[i] == '75%'){
                    update["bri"] = 191;
                } else if(spokenWords[i] == '80%'){
                    update["bri"] = 204;
                } else if(spokenWords[i] == '90%'){
                    update["bri"] = 230;
                } else if(spokenWords[i] == '100%'){
                    update["bri"] = 255;
                }

                //are we turning the lights on or off?
                if(spokenWords[i] == 'aan'){
                    update["on"] = true;
                    update["bri"] = 250;
                } else if(spokenWords[i] == 'uit'){
                    update["on"] = false;
                }
            }
            return update;
        }
        return service;
    }

    angular.module('SmartMirror')
        .factory('HueService', HueService);

}());
