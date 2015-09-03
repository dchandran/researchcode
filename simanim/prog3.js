{
    code: "py/example1.py",

    modules: {  
        inhibitor: "small molecule",
        enzyme: "transcription factor"
    },


    setup: function(bounds,timeseries) {
        debugger;
        enzyme.inputs.inactiveBounds = bounds;
        enzyme.inputs.activeBounds = bounds;
        inhibitor.inputs.bounds = bounds;

        

        inhibitor.connect('molecules', enzyme, 'targets');
    }
}
