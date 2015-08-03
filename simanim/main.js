var _EASEL_STAGE;

function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function initGUI() {
    $("ul.tabs").tabs("div.panes > div");

    var canvas = document.getElementById("canvas");
    fitToContainer(canvas);
    
    // create a new stage and point it at our canvas:
    _EASEL_STAGE = new createjs.Stage(canvas);

    //setup code editors

    //var theme = "ace/theme/monokai"
    var theme = "ace/theme/clouds_midnight"

    function setupCodeEditor(id, language, url) {
        var editor = ace.edit(id);
        editor.setFontSize('16px');
        editor.setTheme(theme);
        editor.renderer.setShowGutter(false); 
        editor.getSession().setMode("ace/mode/" + language);

        if (url)
         $.ajax({
            url:url,
            success: function(data) {
                editor.setValue(data);
            }
          });
    }

    setupCodeEditor("modelpane", "python", 'example.psc');
    setupCodeEditor("codepane", "python", 'py/simulate.py');
    setupCodeEditor("yamlpane", "yaml", 'py/modules.yaml');
}

function main() {
    initGUI();
    var canvas = _EASEL_STAGE.canvas;
    canvas.left = 0;
    canvas.top = 0;

    var bg = new createjs.Shape();
    bg.graphics.beginFill("#222222").drawRect(canvas.left, canvas.top, canvas.width, canvas.height);
    _EASEL_STAGE.addChild(bg);

    lipid_bilayer.inputs.bounds = {left:canvas.left, top:canvas.top, width: canvas.width, height: canvas.height};
    two_component.inputs.numReceptors = 5;
    two_component.inputs.numTfs = 10;
    two_component.inputs.percentActiveTFs = 0.0;
    two_component.inputs.percentActiveMembranes = 0.0;

    lipid_bilayer.connect('bounds',dna_template, 'bounds');
    lipid_bilayer.connect('bounds',two_component, 'inactiveBounds');
    dna_template.connect('bounds',expression_cassette, 'bounds');
    lipid_bilayer.connect('bounds', protein_bursts, 'bounds');
    expression_cassette.connect('lastPartBounds', protein_bursts, 'rnaStartBounds');
    expression_cassette.connect('firstPartBounds', two_component, 'activeBounds');

    expression_cassette.inputs.parts = { p: {type:'promoter', state:'off'}, gfp:{type:'cds', state:'off'} };

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", _EASEL_STAGE);

    var modules = [
        lipid_bilayer,
        dna_template,
        two_component, 
        expression_cassette,
        protein_bursts
    ];
    for (var i=0; i < modules.length; ++i) {
        if (modules[i].init) {
            modules[i].init();
            modules[i].updateDownstream();
        }
        if (modules[i].tick) {
            createjs.Ticker.addEventListener("tick", modules[i].tick);
        }
    }
    
}
