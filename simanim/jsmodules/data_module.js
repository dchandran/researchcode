function TimeSeriesData(name,typename) {
    var module = new AnimModule(name, typename);
    
    module.nextStep = function() {
        if (this.inputs.time.length <= this.inputs.currentIndex) {
            this.inputs.currentIndex = -1;
        }
        this.setCurrentIndex(this.inputs.currentIndex+1);
    }

    module.setCurrentIndex = function(index) {
        var timeArray = this.inputs.time;
        var headers = this.inputs.headers;
        var species = this.inputs.species;

        if (!headers || !species || !timeArray || index < 0 || index >= timeArray.length) return;

        this.inputs.currentIndex = index;
        console.log("TIME = " + timeArray[index])

        var s;

        for (var i=0; i < headers.length; ++i) {
            eval("var " + headers[i] + '=' + species[index][i]);
        }

        for (s in this.outputs) {
            this.outputs[s] = eval(s); //e.g s can be "A/B + C"
            if (isNaN(this.outputs[s])) {
                this.outputs[s] = 0; //0/0 is a very common case, hence justified
            }
        }

        this.updateDownstream();
    }


    module.setCurrentTime = function(time) {
        this.inputs.currentTime = time;
        var timeArray = this.inputs.time;

        if (!timeArray) return;
        var minTime = timeArray[0];
        var maxTime = timeArray[timeArray.length-1];

        if (time < minTime) time = minTime;
        if (time > maxTime) time = maxTime;

        this.setCurrentIndex( Math.trunc(timeArray.length * (time-minTime)/(maxTime - minTime) ) ) ;
    };

    module.init = function(data) {
        this.inputs.time = [];
        this.inputs.species = [];
        this.inputs.headers = [];

        if (data && data.time && data.headers && data.species) {
            this.inputs.time = data.time;
            this.inputs.species = data.species;
            this.inputs.headers = data.headers;
            this.setCurrentIndex(0);
        }
    };

    return module;
}

registerModuleType("time series", TimeSeriesData);

