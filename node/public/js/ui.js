toastr.options = {
    "closeButton": true,
    "debug": true,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

var aceEditor = ace.edit("source_code");

aceEditor.setOptions({
    enableBasicAutocompletion: true,
    enableAutocompletion: true,
    enableSnippets: true,
});

$("#run_button").on("click", function (event) {
    runCode();
});

aceEditor.commands.addCommand({
    bindKey: {
        win: "Ctrl+Enter",
        mac: "Ctrl+Enter"
    },
    exec: runCode,
});

$(document).on('keydown', function (e) {
    if (e.ctrlKey && e.which === 83) {
        var code = aceEditor.getValue();
        var localstorage_code = "";

        for (var i = 0; i < code.length; i++) {
            if (code[i] == '\n') {
                localstorage_code += '@\\n@';
            } else {
                localstorage_code += code[i];
            }
        }
        localStorage.setItem('code', localstorage_code);
        toastr["success"]("Save on Blowser", "Saved successfully");
        e.preventDefault();
        return false;
    }
});

function saveCode() {
    var code = aceEditor.getValue();
    var localstorage_code = "";

    for (var i = 0; i < code.length; i++) {
        if (code[i] == '\n') {
            localstorage_code += '@\\n@';
        } else {
            localstorage_code += code[i];
        }
    }
    localStorage.setItem('code', localstorage_code);
    toastr["success"]("Save on Blowser", "Saved successfully");
}

function setEditorLanguage(language) {
    var languageToMode = {
        c: "c_cpp",
        ruby: "ruby",
        python: "python",
    };
    var mode = languageToMode[language];
    aceEditor.getSession().setMode("ace/mode/" + mode);
}

$("#language").val("c");
setEditorLanguage("c");

$("#language").on("change", function (event) {
    setEditorLanguage(this.value);
});

var obj1 = document.getElementById("selfile");
obj1.addEventListener("change", function (evt) {
    var file = evt.target.files;
    var reader = new FileReader();
    reader.readAsText(file[0]);
    reader.onload = function (ev) {
        console.log(reader.result);
        aceEditor.setValue(reader.result, 0);
        $('#modal_fileopen').modal('toggle');
    }
}, false);

if (localStorage.getItem('font-size') != null) {
    ChangeFontSize(localStorage.getItem('font-size'));
} else {
    ChangeFontSize(17);
    localStorage.setItem('font-size', "17");
}

function ChangeFontSize(font_size) {
    $('#source_code').css('font-size', font_size + 'px');
    localStorage.setItem('font-size', font_size);
}

function ChangeTabSize(tab_size) {
    var code = aceEditor.getValue();
}

if (localStorage.getItem('editor-theme') != null) {
    var editor_theme = "ace/theme/" + localStorage.getItem('editor-theme');
    aceEditor.setTheme(editor_theme);
} else {
    aceEditor.setTheme("ace/theme/monokai");
    localStorage.setItem('editor-theme', 'monokai');
}

function ChangeTheme(theme) {
    aceEditor.setTheme("ace/theme/" + theme);
    localStorage.setItem('editor-theme', theme);
}

function ExportFile() {
    var id = "download";
    var content = aceEditor.getValue();
    console.log(content);
    var blob = new Blob([content], {
        "type": "application/x-msdownload"
    });
    window.URL = window.URL || window.webkitURL;
    $("#" + id).attr("href", window.URL.createObjectURL(blob));
    switch ($('#language').val()) {
        case 'c':
            $("#" + id).attr("download", "Main.c");
            break;
        case 'ruby':
            $("#" + id).attr("download", "Main.rb");
            break;
        case 'python':
            $("#" + id).attr("download", "Main.py");
    }
    $('#modal_export').modal('toggle');
}

var localstorage_code = localStorage.getItem('code');
var code = localstorage_code.replace(/@\\n@/g, '\n');

aceEditor.setValue(code, 0);

// aceEditor.getSession().setAnnotations([{
//     row: 1,
//     column: 0,
//     text: "Error Message", // Or the Json reply from the parser 
//     type: "error" // also "warning" and "information"
// }]);

$(window).keydown(function(e) {
    if (event.ctrlKey && debug_status === true) {
        // pushed Ctrl+[
        if (e.keyCode == 188) {
            aceEditor.getSession().removeMarker(marker);
            if (debug_status_line == 0) {
                $('#line_0')[0].scrollIntoView(true);
                $('#line_0').css('background-color', 'gray');
                var tmp = $('#line_0').html().match('\>.+?\<\/th>');
                res = Number(tmp[0].replace(/[^0-9]/g, ''));
                marker_status = res;
                var range = new Range(res-1, 0, res-1, 200);
                marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
            }
            else if (debug_status_line > 0) {
                $('#line_' + String(debug_status_line)).css('background-color', 'white');
                debug_status_line--;
                var tmp = $('#line_' + String(debug_status_line)).html().match('\>.+?\<\/th>');
                res = Number(tmp[0].replace(/[^0-9]/g, ''));
                marker_status = res;
                var range = new Range(res-1, 0, res-1, 200);
                marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
                $('#line_' + String(debug_status_line))[0].scrollIntoView(true);
                $('#line_' + String(debug_status_line)).css('background-color', 'gray');
            }
        }
        // pushed Ctrl+]
        if (e.keyCode == 190) {
            aceEditor.getSession().removeMarker(marker);
            $('#line_' + String(debug_status_line)).css('background-color', 'white');
            debug_status_line++;
            var tmp = $('#line_' + String(debug_status_line)).html().match('\>.+?\<\/th>');
            res = Number(tmp[0].replace(/[^0-9]/g, ''));
            marker_status = res;
            var range = new Range(res-1, 0, res-1, 200);
            marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
            $('#line_' + String(debug_status_line))[0].scrollIntoView(true);
            $('#line_' + String(debug_status_line)).css('background-color', 'gray');
        }
    }
});