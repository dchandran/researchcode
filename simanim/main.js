var _EASEL_STAGE;
var _EDITORS = {};

function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function updateCurrentTime(values, handle) {
    TimeSeriesData.setCurrentIndex(Number(values[0]));

    var rangeSliderValueElement = document.getElementById('time-slider-value');
    rangeSliderValueElement.innerHTML = "Current Time: " + values[0];
}

function runPyCode(code) {
    $.ajax({
        type: 'POST',
        url: '/api/code',
        data: encodeURI(code),
        success: function(data) {
            try {
                data = JSON.parse(data);
                TimeSeriesData.init(data);
                TimeSeriesData.setCurrentIndex(0);
                if (_EDITORS["modelpane"])
                    $.ajax({
                        url:'py/temp.psc',
                        success: function(data) {
                            _EDITORS["modelpane"].setValue(data);
                        }
                      });
            } catch (e) {
                console.log(e);
            }
        }
    });
}

function updatePscModel(code) {
    $.ajax({
        type: 'POST',
        url: '/api/model',
        data: encodeURI(code),
        success: function(data) {
        }
    });
}

function updateModules(code) {
    $.ajax({
        type: 'POST',
        url: '/api/modules',
        data: encodeURI(code),
        success: function(data) {
        }
    });
}



function initGUI() {

    /*$(window).resize(function(){
        $("#center").width($(window).width() * 0.7);
        $("#right").width($(window).width() * 0.3);
        $("#center").height($(window).height());
        $("#right").height($(window).height());
        fitToContainer(document.getElementById("canvas"));
        for (var i=0; i < _EDITORS.length; ++i)
            _EDITORS[i].resize();
    });*/

    $("ul.tabs").tabs("div.panes > div");

    var canvas = document.getElementById("canvas");
    fitToContainer(canvas);
    
    // create a new stage and point it at our canvas:
    _EASEL_STAGE = new createjs.Stage(canvas);

    //setup code editors

    //var theme = "ace/theme/monokai"
    var theme = "ace/theme/clouds_midnight"

    function setupCodeEditor(id, language, url, callback) {
        var editor = ace.edit(id);
        editor.setFontSize('16px');
        editor.setTheme(theme);
        //editor.renderer.setShowGutter(false); 
        editor.getSession().setMode("ace/mode/" + language);
        editor.setOptions({maxLines: Infinity});
        _EDITORS[id] = editor;

        if (url)
         $.ajax({
            url:url,
            success: function(data) {
                editor.setValue(data);
            }
          });

        if (callback)
            editor.commands.addCommand({
                name: 'ExScript',
                bindKey: 'Shift-Enter',
                exec: function(editor) {
                    callback(editor.getValue());
                },
                readOnly: true
            });
    }

    setupCodeEditor("modelpane", "python", 'py/temp.psc', updatePscModel);
    setupCodeEditor("codepane", "python", 'py/example1.py', runPyCode);
    setupCodeEditor("yamlpane", "yaml", 'py/modules.yaml', updateModules);

    //setup slider
    var rangeSlider = document.getElementById('time-slider');

    noUiSlider.create(rangeSlider, {
        start: [ 0 ],
        step: 1,
        range: {
            'min': [  0 ],
            'max': [ 100 ]
        },
        pips: { // Show a scale with the slider
            mode: 'range',
            density: 4
        }
    });

    rangeSlider.noUiSlider.on('slide', updateCurrentTime);
}

function initCanvas() {
    var canvas = _EASEL_STAGE.canvas;
    canvas.left = 0;
    canvas.top = 0;

    var bg = new createjs.Shape();
    bg.graphics.beginFill("#000000").drawRect(canvas.left, canvas.top, canvas.width, canvas.height);
    _EASEL_STAGE.addChild(bg);
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", _EASEL_STAGE);
    createjs.Ticker.addEventListener("tick", degradationAnimation);
}

function connectModules() {
    lipid_bilayer.connect('outerCellBounds', source_molecule, 'bounds');
    lipid_bilayer.connect('innerCellBounds',dna_template, 'bounds');
    lipid_bilayer.connect('innerCellBounds',two_component, 'inactiveBounds');
    lipid_bilayer.connect('innerCellBounds', protein_bursts, 'bounds');

    dna_template.connect('bounds',expression_cassette, 'bounds');
    
    expression_cassette.connect('lastPartBounds', protein_bursts, 'rnaStartBounds');
    expression_cassette.connect('firstPartBounds', two_component, 'activeBounds');
}

function connectDataModule() {
    TimeSeriesData.connect('(R1+R0)/5', two_component, "numReceptors");
    TimeSeriesData.connect('(TF1+TF0)/5', two_component, "numTFs");    
    TimeSeriesData.connect('R1/(R1+R0)', two_component, "percentActiveMembranes");
    TimeSeriesData.connect('TF1/(TF1+TF0)', two_component, "percentActiveTFs");
    TimeSeriesData.connect('gfp_on', expression_cassette, "state");
    TimeSeriesData.connect('gfp_mRNA', protein_bursts, "numRNA");
    TimeSeriesData.connect('GFP', protein_bursts, "numProteins");
}

function initModules() {
    var modules = [
        lipid_bilayer,
        dna_template,
        two_component, 
        expression_cassette,
        protein_bursts,
        source_molecule
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

function main() {
    initGUI();
    initCanvas();

    source_molecule.inputs.numMolecules = 100;
    two_component.inputs.numReceptors = 5;
    two_component.inputs.numTfs = 10;
    two_component.inputs.percentActiveTFs = 0.0;
    two_component.inputs.percentActiveMembranes = 0.0;

    lipid_bilayer.inputs.bounds = {left:canvas.left, top:canvas.top, width: canvas.width, height: canvas.height};
    expression_cassette.inputs.parts = { p: {type:'promoter'}, gfp:{type:'cds'} };
    expression_cassette.inputs.state = 0;

    connectModules();
    connectDataModule();
    initModules();
}
