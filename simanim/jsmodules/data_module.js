function TimeSeriesData(name,typename) {
    var module = new AnimModule(name, typename);

    module.setCurrentIndex = function(index) {
        var timeArray = this.inputs.time;
        var headers = this.inputs.headers;
        var species = this.inputs.species;

        if (!headers || !species || !timeArray || index < 0 || index >= timeArray.length) return;

        this.inputs.currentIndex = index;
        var s;

        for (var i=0; i < headers.length; ++i) {
            eval("var " + headers[i] + '=' + species[index][i]);
        }

        for (s in this.outputs) {
            this.outputs[s] = eval(s); //e.g s can be "A/B + C"
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
        this.inputs.currentIndex = 0;
        this.inputs.time = [];
        this.inputs.species = [];
        this.inputs.headers = [];

        if (data && data.time && data.headers && data.species) {
            this.inputs.time = data.time;
            this.inputs.species = data.species;
            this.inputs.headers = data.headers;
        }
    };

    return module;
}

registerModuleType("time series", TimeSeriesData);

