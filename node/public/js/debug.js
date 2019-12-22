function debug() {
    var array = [];
    array.push([document.getElementById("array_name_1").value, document.getElementById("array_len_1").value]);
    array.push([document.getElementById("array_name_2").value, document.getElementById("array_len_2").value]);
    array.push([document.getElementById("array_name_3").value, document.getElementById("array_len_3").value]);

    // Form check
    var judge = true;
    for (var i=0; i<array.length; i++) {
        if (array[i][0] == "" || array[i][1] == "" || isNaN(array[i][1])) judge = false;
    }

    if (judge) {
        $('#alert-array').hide();
        $('#modal_array').modal('toggle');
    }
    else if (judge == false) $('#alert-array').show();
}