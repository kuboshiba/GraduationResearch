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
        
        $('#db_result').append('<div class=""><table class="table table-striped"><thead><tr><th>LineNo.</th><th>Sentence</th><th>Variable</th></tr></thead><tbody id="abc"></tbody></table></div>');
        
        var flag = true;
        var insert = "";
        for (var i=2; i<res_array.length; i++) {
            if (res_array[i].indexOf('@@@') != -1) {
                var line = res_array[i].split('@@@');
                insert = "<tr><td>" + line[0] + "</td><td>" + line[1] +"</td><td>";
                if ((res_array[i+1].indexOf('@@@') == -1) && (res_array[i+1].match(/\s=\s/) != null)) {
                    insert = insert + res_array[i+1];
                    var now = i+2;
                    while(flag == true) {
                        if ((res_array[now].indexOf('@@@')) == -1 && (res_array[now].match(/\s=\s/) != null)) {
                            insert = insert + "&emsp;&emsp;&emsp;" + res_array[now];
                        } else {
                            flag = false;
                        }
                        now++;
                    }
                    insert = insert + "</td></tr>";
                    flag = true;
                    $('#abc').append(insert);
                } else {
                    insert = insert + "</td></tr>";
                    $('#abc').append(insert);
                }
            }
        }

        }).fail(function (xhr, status, error) {
            $("#debug_button").text("🐞 Debug").prop("disabled", false);
            alert(status);
        });
    }
}