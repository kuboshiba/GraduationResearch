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
            console.log(res);
        }).fail(function (xhr, status, error) {
            alert(status);
        });
    }
}