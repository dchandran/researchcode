var _CHART;
var _EASEL_STAGE;
var _EDITORS = {};
var _CODEFILE = 'py/example1.py';
var _TimeSeriesData = createModuleFromType("TIME SERIES", "time series");

function reset() {
    createjs.Ticker.removeAllEventListeners();
    var i;

    for (i in _MODULES) {
        delete _MODULES[i];
    }

    delete _MODULES;

    _MODULES = {};
    _DEGRADING_MOLECULES.length = 0;

    if (_EASEL_STAGE) {
        _EASEL_STAGE.removeAllChildren();
        _EASEL_STAGE.update();
    }

    delete _TimeSeriesData;
    _TimeSeriesData = createModuleFromType("TIME SERIES", "time series");

    if (_CHART) {
        _CHART.destroy();
        _CHART = null;
    }
    initCanvas();
}


var _INTERVAL_FUNC = null;
function play(intr) {
    if (!intr) intr = 3000;

    _INTERVAL_FUNC = setInterval(
        
        function(){ 
            _TimeSeriesData.nextStep(); 
        }, 

        intr);

}

function pause() {
    if (_INTERVAL_FUNC) {
        clearInterval(_INTERVAL_FUNC);
        delete _INTERVAL_FUNC;
        _INTERVAL_FUNC = null;
    }
}

function fitToContainer(canvas) {
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function updateCurrentTime(values, handle) {
    _TimeSeriesData.setCurrentIndex(Number(values[0]));
}

function runPyCode(code) {
    $.ajax({
        type: 'POST',
        url: '/api/code',
        data: encodeURI(code),
        success: function(data) {
            try {
                data = JSON.parse(data);
                updateGraph(data);
                _TimeSeriesData.init(data);
                _TimeSeriesData.setCurrentIndex(0);
                if (_EDITORS["modelpane"] && data.modelstring)
                    _EDITORS["modelpane"].setValue(data.modelstring);
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

function updateGraph(data) {
    var id = "#plotpane";
    if (!_CHART) {
        _CHART = c3.generate({
            bindto: id,
            data: { x: 'time', columns: [] }
        });
    }

    var data2 = {x:'time',columns:[]};
    var col = ['time'];
    var i,j;

    for (i=0; i < data.time.length; ++i) {
        col.push(Math.round(data.time[i] * 100) / 100);
    }

    data2.columns.push(col);

    for (i=0; i < data.headers.length; ++i) {
        col = [data.headers[i]];
        for (j=0; j < data.species.length; ++j) {
            col.push(data.species[j][i]);
        }
        data2.columns.push(col);
    }

    _CHART.load(data2);
}

function loadCodeFile(id, url) {
    if (url)
        $.ajax({
            url:url,
            dataType: "text",
            success: function(data) {
                _EDITORS[id].setValue(data);
            }
        });
}

function setupCodeEditor(id, language, url, callback) {
    //var theme = "ace/theme/monokai"
    var theme = "ace/theme/clouds_midnight";
    //var theme = "ace/theme/kr_theme";

    var editor = ace.edit(id);
    editor.setFontSize('20px');
    editor.setTheme(theme);
    //editor.renderer.setShowGutter(false); 
    editor.getSession().setMode("ace/mode/" + language);
    editor.setOptions({maxLines: Infinity});
    _EDITORS[id] = editor;

    
    loadCodeFile(id, url);

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

    setupCodeEditor("modelpane", "python", 'temp.psc', updatePscModel);
    setupCodeEditor("codepane", "python", _CODEFILE, runPyCode);
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
     
    canvas.left = 0;
    canvas.top = 0;

    var bg = new createjs.Shape();
    bg.graphics.beginFill("#000000").drawRect(canvas.left, canvas.top, canvas.width, canvas.height);
    _EASEL_STAGE.addChild(bg);
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", _EASEL_STAGE);
    createjs.Ticker.addEventListener("tick", degradationAnimation);
}


function initModules(modules) {
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
}

function loadProgram(fileurl) {
    $.ajax({
        url:fileurl,
        dataType: "text",
        success: function(data) {
            try {
                eval("var obj = " + data);
                var setupFunc;
                var lst = [];
                if (obj) {
                    if (obj.code) {
                        _CODEFILE = obj.code;
                        loadCodeFile("codepane", _CODEFILE);
                    }
                    if (obj.modules) {
                        for (var i in obj.modules) {
                            //example: var coms = createModuleFromType("ComS", "transcription factor");
                            eval(i + " = createModuleFromType('" + i + "', '" + obj.modules[i] + "');");
                            eval('lst.push(' + i + ');');
                        }
                    }
                    if (obj.setup) {
                        setupFunc = obj.setup;
                    }
                }

                if (setupFunc) {
                    reset();
                    var canvas = _EASEL_STAGE.canvas;
                    var bounds = {left:canvas.left, top:canvas.top, width: canvas.width, height: canvas.height};
                    setupFunc(bounds, _TimeSeriesData);
                    initModules(lst);
                }
            } catch (e) {
                console.log(e);
            }
      }
  });
}
