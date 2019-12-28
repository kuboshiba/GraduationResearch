function debug() {
    var array = [];
    var array_name_1 = document.getElementById("array_name_1").value;
    var array_len_1 = document.getElementById("array_len_1").value;
    var array_name_2 = document.getElementById("array_name_2").value;
    var array_len_2 = document.getElementById("array_len_2").value;
    var array_name_3 = document.getElementById("array_name_3").value;
    var array_len_3 = document.getElementById("array_len_3").value;

    if (array_name_1 != "" && array_len_1 != "" && !isNaN(array_len_1))
        array.push({'name': array_name_1, 'len': array_len_1});
    if (array_name_2 != "" && array_len_2 != "" && !isNaN(array_len_2))
        array.push({'name': array_name_2, 'len': array_len_2});
    if (array_name_3 != "" && array_len_3 != "" && !isNaN(array_len_3))
        array.push({'name': array_name_3, 'len': array_len_3});

    var json_array = JSON.stringify(array);
    
    if (array.length == 0) $('#alert-array').show();
    else {
        $('#alert-array').hide();
        $('#modal_array').modal('toggle');

        var source_code = aceEditor.getValue();

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
            $("#debug_button").text("🐞 Debug").prop("disabled", false);
            
            var res_new = res.replace(/\(gdb\)/g, '');
            res_new = res_new.replace(/\r?\n/g, '<br>');
            res_new = res_new.replace(/\r?\t/g, '@@@');
            var res_array = res_new.split('<br>');
            console.log(res_array);

            $("#db_result").empty();
            $('#db_result').append('<span style="color: red">' + res_array[1] + '</span><br><br>');
        
            $('#db_result').append("<div><table class='table table-striped'><thead><tr><th>LineNo.</th><th>Sentence</th><th>Variable</th></tr></thead><tbody id='abc'></tbody></table></div>");
        
            var line = [];
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
                        temp.push(res_array[now]);
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

            for (var i=0; i<line.length; i++) {
                var insert = "";
                insert = "<tr><th style='text-align: center'>" + line[i][0] +
                        "</th><td>" + line[i][1] + 
                        "</td>";
                if (line[i].length >= 3) {
                    insert += "<td>";
                    for (var j=0; j<line[i][2].length; j++) {
                        insert += line[i][2][j] + "&emsp;&emsp;";
                    }
                    insert += "</td></tr>";
                } else {
                    insert += "<td></td></tr>";
                }
                $('#abc').append(insert);
            }
        }).fail(function (xhr, status, error) {
            $("#debug_button").text("🐞 Debug").prop("disabled", false);
            alert(status);
        });
    }
}