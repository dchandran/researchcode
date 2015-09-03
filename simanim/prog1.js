{
    code: "py/example1.py",

    modules: {
        source_molecule: "source",
        two_component: "two component",
        expression_cassette: "expression cassette",
        lipid_bilayer: "lipid bilayer",
        dna_template: "DNA template"
    },


    setup: function(bounds,timeseries) {

        source_molecule.inputs.numMolecules = 100;
        two_component.inputs.numReceptors = 5;
        two_component.inputs.numTfs = 10;
        two_component.inputs.percentActiveTFs = 0.0;
        two_component.inputs.percentActiveMembranes = 0.0;

        lipid_bilayer.inputs.bounds = bounds;
        expression_cassette.inputs.parts = { p: {type:'promoter'}, gfp:{type:'cds'} };
        expression_cassette.inputs.state = 0;
        expression_cassette.inputs.orientation = 'forward';

        lipid_bilayer.connect('outerCellBounds', source_molecule, 'bounds');
        lipid_bilayer.connect('innerCellBounds',dna_template, 'bounds');
        lipid_bilayer.connect('innerCellBounds',two_component, 'inactiveBounds');

        dna_template.connect('left',expression_cassette, 'startPos');
        lipid_bilayer.connect('innerCellBounds',expression_cassette, 'bounds');
        
        
        lipid_bilayer.connect('innerCellBounds', two_component, 'activeBounds');
        expression_cassette.connect('firstPart', two_component, 'target');

        timeseries.connect('(r1+r0)/2', two_component, "numReceptors");
        timeseries.connect('(tf1+tf0)/2', two_component, "numTFs");    
        timeseries.connect('tf1/(r1+r0)', two_component, "percentActiveMembranes");
        timeseries.connect('tf1/(tf1+tf0)', two_component, "percentActiveTFs");
        timeseries.connect('gene_on', expression_cassette, "state");
        timeseries.connect('mRNA', expression_cassette, "numRNA");
        timeseries.connect('GFP', expression_cassette, "numGFP");
    }
}
