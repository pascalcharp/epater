var ws = new WebSocket("ws://127.0.0.1:31415/");

// Breakpoints and markers
var asm_breakpoints = [];
var mem_breakpoints_r = [];
var mem_breakpoints_w = [];
var mem_breakpoints_rw = [];
var mem_breakpoints_e = [];
var mem_breakpoints_instr = [];
var debug_marker = null;

ws.onmessage = function (event) {
	obj = JSON.parse(event.data);

    var element = document.getElementById(obj[0]);
    if (element != null) {
        $(element).val(obj[1]);
        $(element).prop("disabled", false);
    } else if (obj[0] == 'disable') {
        //$(obj[1]).prop("disabled", true);
        $("[name='" + obj[1] + "']").prop("disabled", true);
    } else if (obj[0] == 'codeerror') {
        // row indices are 0-indexed
        editor.session.setAnnotations([{row: obj[1], text: obj[2], type: "error"}]);
    } else if (obj[0] == 'debugline') {
        if (debug_marker !== null) { editor.session.removeMarker(debug_marker); }
        if (obj[1] >= 0) {
            aceRange = ace.require('ace/range').Range;
            debug_marker = editor.session.addMarker(new aceRange(obj[1], 0, obj[1] + 1, 0), "debug_line", "text");
            // TODO: Ajouter une annotation? Gutter decoration?
        } else {
            debug_marker = null;
        }
        //editableGrid.refreshGrid();
        //editableGrid.renderGrid("memoryview", "testgrid");
    } else if (obj[0] == 'debuginstrmem') {
        mem_breakpoints_instr = obj[1];
        editableGrid.refreshGrid();
    } else if (obj[0] == 'mempartial') {
        for (var i = 0; i < obj[1].length; i++) {
            var row = Math.floor(obj[1][0] / 16);
            var col = (obj[1][0] % 16) + 1;
            editableGrid.setValueAt(row, col, obj[1][1], false);
        }

        editableGrid.refreshGrid();
        //editableGrid.renderGrid("memoryview", "testgrid");
    } else if (obj[0] == 'mem') {
        editableGrid.load({"data": obj[1]});
        editableGrid.renderGrid("memoryview", "testgrid");
    } else if (obj[0] == 'membp_r') {
        mem_breakpoints_r = obj[1];
    } else if (obj[0] == 'membp_w') {
        mem_breakpoints_w = obj[1];
    } else if (obj[0] == 'membp_rw') {
        mem_breakpoints_rw = obj[1];
    } else if (obj[0] == 'membp_e') {
        mem_breakpoints_e = obj[1];
    } else if (obj[0] == 'banking') {
        $("#tab-container").easytabs('select', '#tabs1-' + obj[1]);
        if (obj[1] == "User") {
            $("#spsr_title").text("SPSR");
        } else {
            $("#spsr_title").text("SPSR (" + obj[1] + ")");
        }
    } else if (obj[0] == 'error') {
        $("#message_bar").text(obj[1]);

        /*$(this).slideToggle("normal", "easeInOutBack", function(){
            $("#message_bar").slideToggle("normal", "easeInOutBack");
        });*/

        $("#message_bar").slideDown("normal", "easeInOutBack");
    }
};


function removeCodeErrors() {
    editor.session.clearAnnotations();
}

function assemble() {
    ws.send(JSON.stringify(['assemble', editor.getValue()]));
    
    // Remove code errors tooltips
    codeerrors = {};
    $(".ace_content").css("background-color", "#FFF");

    asm_breakpoints.length = 0;
    editor.session.clearBreakpoints();
}

function simulate() {
    var animate_speed = $('#animate_speed').val();
    ws.send(JSON.stringify(['run', animate_speed]));
}

function sendBreakpointsInstr() {
    ws.send(JSON.stringify(['breakpointsinstr', asm_breakpoints]));
}

function sendMsg(msg) {
    ws.send(JSON.stringify([msg]));
}
