function runCode() {
    var loading = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

    $("#run_button").html('Running ' + loading).prop("disabled", true);

    var language = $("#language").val();
    var source_code = aceEditor.getValue();
    var input = $("#input").val();

    var localstorage_code = "";

    for (var i = 0; i < source_code.length; i++) {
        if (source_code[i] == '\n') {
            localstorage_code += '@\\n@';
        } else {
            localstorage_code += source_code[i];
        }
    }
    localStorage.setItem('code', localstorage_code);

    switch (language) {
        case 'c':
            console.log("gcc -o Main Main.c && ./Main");
            $('#terminal_command').text(" gcc -Wall -o Main Main.c && ./Main");
            break;
        case 'ruby':
            console.log("ruby Main.rb");
            $('#terminal_command').text(" ruby Main.rb");
            break;
        case 'python':
            console.log("python3 Main.py");
            $('#terminal_command').text(" python3 Main.py");
    }

    aceEditor.getSession().removeMarker(marker); // remove marker

    $.ajax({
        url: "/api/run",
        method: "POST",
        data: {
            language: language,
            source_code: source_code,
            input: input,
        },
    }).done(function (result) {
        $("#stdout").text(result.stdout);
        $("#stderr").text(result.stderr);
        $("#time").text(result.time + ' s');
        $("#exit_code").text(result.exit_code);
        $("#run_button").text("▶ Run (Ctrl+Enter)").prop("disabled", false);
        if (result.stderr == '') {
            toastr["success"]("Successfully compiled", "Success");
        } else {
            toastr["error"]("Failed to compile", "Failure");
        }
    }).fail(function (error) {
        alert("Request Failed: " + error);
        $("#run_button").text("Run (Ctrl+Enter)").prop("disabled", false);
    });
}