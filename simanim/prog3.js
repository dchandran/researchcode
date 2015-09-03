{
    code: "py/example1.py",

    modules: {  
        inhibitor: "small molecule",
        enzyme: "enzyme"
    },

    setup: function(bounds,timeseries) {
        debugger;
        enzyme.inputs.inactiveBounds = bounds;
        enzyme.inputs.activeBounds = bounds;
        inhibitor.inputs.bounds = bounds;
        inhibitor.inputs.numMolecules = 10;
        enzyme.inputs.numTfs = 10;

        

        inhibitor.connect('molecules', enzyme, 'targets');
    }
}
