{
    code: "py/example1.py",

    modules: {  
        inhibitor: "inhibitor",
        enzyme: "transcription factor"
    },


    setup: function(bounds,timeseries) {
        enzyme.inputs.inactiveBounds = bounds;
        enzyme.inputs.activeBounds = bounds;
        inhibitor.inputs.bounds = bounds;

        

        inhibitor.connect('molecules', enzyme, 'targets');
    }
}
