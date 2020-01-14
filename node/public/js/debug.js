var debug_status = false;
var line = [];

function debug() {
    var array = [];
    var array_name_1 = document.getElementById("array_name_1").value;
    var array_len_1 = document.getElementById("array_len_1").value;

    var flag = false;
    if ((!isNaN(array_len_1) || array_len_1 == "")) {
        flag = true;
    } else {
        $('#alert-array').show();
    }

    if (array_name_1 != "" && array_len_1 != "" && !isNaN(array_len_1))
        array.push({'name': array_name_1, 'len': array_len_1});

    var json_array = JSON.stringify(array);
    
    if (flag == true) {
        $('#alert-array').hide();
        $('#modal_array').modal('toggle');
        $(".terminal").css('display', 'block');
        $(".debug_variable").css('display', 'none');

        var source_code = aceEditor.getValue();
        console.log(source_code);

        var loading = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        $("#debug_button").html('Debugging ' + loading).prop("disabled", true);
        $.ajax({
            async: false,
            url: '/api/debug',
            type: 'POST',
            data: {
                array: json_array,
                source_code: source_code
            },
            dataType: 'json'
        }).done(function (res) {
            debug_status = true;
            debug_status_line = 0;
            $("#debug_button").text("🐞 ステップ毎のデバッグ").prop("disabled", false);
            toastr["success"]("Successfully debuged", "Success");
            aceEditor.getSession().removeMarker(marker); // remove marker

            var res_new = res.replace(/\(gdb\)/g, '');
            res_new = res_new.replace(/\r?\n/g, '<br>');
            res_new = res_new.replace(/\r?\t/g, '@@@');
            var res_array = res_new.split('<br>');
            console.log(res_array);
            
            $('.debug_variable').empty();
            $("#db_result").empty();
            $('#db_result').append("<div><table class='table table-sm table-hover'><thead><tr><th style='text-align: center;'>LineNo.</th><th>Sentence</th><th>Variable</th></tr></thead><tbody id='abc'></tbody></table></div>");

            for (var i=2; i<res_array.length; i++) {
                if (res_array[i].indexOf('@@@') != -1) {
                    var tmp = res_array[i].split('@@@');
                    for (var j=0; j<tmp[0].length; j++) {
                        if (tmp[0][j] != ' ') {
                            tmp[0] = tmp[0].slice(j);
                            break;
                        }
                    }
                    for (var j=0; j<tmp[1].length; j++) {
                        if (tmp[1][j] != ' ') {
                            tmp[1] = tmp[1].slice(j);
                            break;
                        }
                    }
                    var now = i + 1;                    
                    var temp = [];
                    while (true) {
                        if (res_array.length == now) break;
                        if (res_array[now].indexOf('@@@') != -1) break;
                        for (var k=0; k<res_array[now].length; k++) {
                            if (res_array[now][k] != ' ') {
                                res_array[now] = res_array[now].slice(k);
                                break;
                            }
                        }
                        if (res_array[now].indexOf(" = ") != -1) temp.push(res_array[now]);
                        now++;
                    }

                    for (var j=0; j<temp.length; j++) {
                        if (temp[j].indexOf(": *") != -1) {
                            var a = temp[j].split(' = ');
                            var b = a[0].split('@');
                            var c = b[0].split(': *');
                            var val =  c[1] + " = " +  a[1];
                            if (temp.indexOf(val) != -1) temp.splice(val , 1);
                            break;
                        }
                    }
                    tmp.push(temp);
                    line.push(tmp);
                }
            }
            for (var i=1; i<line.length; i++) line[i-1][2] = line[i][2];
            console.log(line);

            var code = aceEditor.getValue();
            var cnt = 1;
            var count = 1;
            for (var i=0; i<code.length; i++) { if (code[i] == '\n') cnt++; }
            var last_code = "";
            for (var i=0; i<code.length; i++) {
                if (code[i] == '\n') {
                    count++;
                    if (count == cnt) {
                        for (var j=i+1; j<code.length; j++) {
                            last_code += code[j];
                        }
                    }
                }
            }
            var buf = line[line.length-1][1];
            line[line.length-1][1] = last_code;
            buf = buf.split(last_code + " ");
            line[line.length-1][2].unshift(buf[1]);

            for (var i=0; i<line.length; i++) {
                var insert = "";
                insert = "<tr onmouseover='highlight_line(this);' class='tr_line' id='line_" + String(i) +
                        "'><th style='text-align: center'>" + line[i][0] +
                        "</th><td>" + line[i][1] + 
                        "</td>";
                if (line[i].length >= 3) {
                    insert += "<td>";
                    for (var j=0; j<line[i][2].length; j++) {
                        if (line[i][2][j] != undefined) insert += line[i][2][j] + "&emsp;&emsp;";
                    }
                    insert += "</td></tr>";
                } else {
                    insert += "<td></td></tr>";
                }
                $('#abc').append(insert);
            }
        }).fail(function (xhr, status, error) {
            $("#debug_button").text("🐞 ステップ毎のデバッグ").prop("disabled", false);
            alert(status);
        });
    }
}
var Range = ace.require('ace/range').Range;
var marker_status = 0;
var res, marker = 0;
function highlight_line(info) {
    aceEditor.getSession().removeMarker(marker);
    var tmp = info.innerHTML.match('\>.+?\<\/th>');
    res = Number(tmp[0].replace(/[^0-9]/g, ''));
    marker_status = res;
    var range = new Range(res-1, 0, res-1, 200);
    marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
}

function debug_block() {
    if (debug_status == false) {
        alert("ステップ毎のデバッグを先に実行してください");
        return false;
    } else {
        $("#db_result").empty();
        $(".debug_variable").empty();
        $(".terminal").css('display', 'none');
        $(".debug_variable").css('display', 'block');
        var source_code = aceEditor.getValue();
        var data = [];
        var tmp = "";
        for (var i=0; i<source_code.length; i++) {
            if (source_code[i] != '\n') tmp += source_code[i];
            else { data.push(tmp); tmp = ""; }
        }

        var block = [];
        for (var i=0; i<data.length; i++) {
            if (data[i].indexOf("for") != -1 || data[i].indexOf("while") != -1 || data[i].indexOf("if") != -1) {
                block.push([i+1, data[i]]);
            }
        }
        
        for (var i=0; i<block.length; i++) {
            for (var j=0; j<data.length; j++) {
                if (block[i][1] == data[j]) {
                    for (var k=0; k<data[j].length; k++) {
                        if (data[j][k] == ")") {
                            for (var l=k+1; l<data[j].length; l++) {
                                if (data[j][l] == "{") {
                                    var flag1 = true;
                                    for (var m=l+1; m<data[j].length; m++) {
                                        if (data[j][m] == "}") {
                                            block[i].push(block[i][0]);
                                            flag1 = false;
                                            break;
                                        }
                                    }
                                    if (flag1 == true) {
                                        var flag2 = true;
                                        var buf = j+1;
                                        var count = 0;
                                        while (flag2 == true) {
                                            var flag3 = true;
                                            if (data[buf].indexOf("{") != -1) count++;
                                            for (var n=0; n<data[buf].length; n++) {
                                                if (data[buf][n] == "}") {
                                                    if (count == 0) {
                                                        flag3 = false;
                                                        block[i].push(buf+1);
                                                        break;
                                                    } else {
                                                        count--;
                                                    }
                                                }
                                            }
                                            if (flag3 == true) buf++;
                                            else flag2 = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log(block);

        var insert = '<div class="form-check">' +
            '<input class="form-check-input" type="radio" name="exampleRadios" ' +
            'id="exampleRadios0" value="0" checked>' + 
            '<label class="form-check-label" ' + 
            'for="exampleRadios0">' + block[0][1] + '</label></div>';
        
        $('.debug_variable').append(insert);

        for (var i=1; i<block.length; i++) {
            insert = "";
            insert = '<div class="form-check">' +
                '<input class="form-check-input" type="radio" name="exampleRadios" ' +
                'id="exampleRadios' + String(i) + '" value="' + String(i) + '">' +
                '<label class="form-check-label" ' + 
                'for="exampleRadios' + String(i) + '">' + block[i][1] + '</label></div>';
            $('.debug_variable').append(insert);
        }

        aceEditor.getSession().removeMarker(marker);

        if (block[0].length == 3) {
            var range = new Range(block[0][0]-1, 0, block[0][2]-1, 200);
            marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
        } else {
            var range = new Range(block[0][0]-1, 0, block[0][0]-1, 200);
            marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
        }

        $('input[name="exampleRadios"]').change(function() {
            var value = $(this).val();
            aceEditor.getSession().removeMarker(marker);
            if (block[value].length == 3) {
                var range = new Range(block[value][0]-1, 0, block[value][2]-1, 200);
                marker = aceEditor.getSession().addMarker(range, "myMarker", "line");

                $("#db_result").empty();
                $('#db_result').append("<div><table class='table table-sm table-hover'><thead><tr><th style='text-align: center;'>LineNo.</th><th>Sentence</th><th>Variable</th></tr></thead><tbody id='abc'></tbody></table></div>");

                for (var i=0; i<line.length; i++) {
                    if (block[value][0] == line[i][0]) {
                        var insert = "";
                        insert = "<tr class='tr_line' id='line_" + String(i) +
                            "'><th style='text-align: center'>" + line[i][0] +
                            "</th><td>" + line[i][1] + 
                            "</td>";
                        if (line[i].length >= 3) {
                            insert += "<td>";
                            for (var j=0; j<line[i][2].length; j++) {
                                if (line[i][2][j] != undefined) insert += line[i][2][j] + "&emsp;&emsp;";
                            }
                            insert += "</td></tr>";
                        } else {
                            insert += "<td></td></tr>";
                        }
                        $('#abc').append(insert);
                    }
                }
            } else {
                var range = new Range(block[value][0]-1, 0, block[value][0]-1, 200);
                marker = aceEditor.getSession().addMarker(range, "myMarker", "line");
            }
        });
    }
}