{
    code: "py/example2.py",

    modules: {
        var comk: "enzyme",
        var coms: "enzyme",
        var meca: "small molecule",
        var comk_gene: "expression cassette",
        var coms_gene: "expression cassette",
        var dna: "DNA template"
    },

    setup: function(bounds, timeseries) {

        dna.inputs.bounds = bounds;
        comk.inputs.inactiveBounds = bounds;
        comk.inputs.activeBounds = bounds;
        coms.inputs.inactiveBounds = bounds;
        coms.inputs.activeBounds = bounds;
        comk_gene.inputs.bounds = bounds;
        coms_gene.inputs.bounds = bounds;
        meca.inputs.bounds = bounds;

        coms_gene.inputs.orientation = 'forward';
        comk_gene.inputs.orientation = 'reverse';
        dna.connect('center', comk_gene, 'startPos');
        dna.connect('center', coms_gene, 'startPos');
        
        comk.connect('molecules', meca, 'comk');
        coms.connect('molecules', meca, 'coms');

        comk_gene.connect('mRNAPos', comk, 'startPos');
        coms_gene.connect('mRNAPos', coms, 'startPos');            

        comk_gene.inputs.parts = { p: {type:'promoter'}, comk:{type:'cds'} };
        comk_gene.inputs.state = 0;

        coms_gene.inputs.parts = { p: {type:'promoter'}, coms:{type:'cds'} };
        coms_gene.inputs.state = 0;

        coms_gene.connect('firstPart', comk, 'target1');
        comk_gene.connect('firstPart', comk, 'target2');
        
        timeseries.connect('MecA+MecAComK+MecAComS', meca, "numMolecules");
        timeseries.connect('MecAComK', meca, "comk bound");
        timeseries.connect('MecAComS', meca, "coms bound");

        timeseries.connect('ComK/(ComK+MecAComK)', comk, "percentActive");
        
        timeseries.connect('ComK+MecAComK', comk, "numMolecules");
        timeseries.connect('ComS+MecAComS', coms, "numMolecules");

        timeseries.connect('comk_gene_on', comk_gene, "state");
        timeseries.connect('coms_gene_on', coms_gene, "state");

        timeseries.connect('comk_mRNA', comk_gene, "numRNA");
        timeseries.connect('coms_mRNA', coms_gene, "numRNA");
    }
}
