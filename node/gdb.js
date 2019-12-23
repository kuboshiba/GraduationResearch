var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var child_process = require('child_process');
var cp = require('child_process');
var fs = require('fs');

var filename = process.argv[2];
var argv_num = Number(process.argv[3]);

var cmd = [];
for (var i=4; i<4+argv_num; i++) {
    var str = process.argv[i].split(':');
    cmd.push("display *" + str[0] + "@" + str[1]);
}
console.log(cmd);

var childProcess = cp.spawn('gdb', [filename]);
childProcess.stdout.setEncoding('utf8');
childProcess.stdout.on('error', function (err) { console.error(err); process.exit(1); });
childProcess.stdin.on('error', function (err) { console.error(err); process.exit(1); });

var stdout = "";
var cnt = 0;
childProcess.stdout.on("data", function (data) {
    if (cnt > 6) { console.log(data); stdout = stdout + data }
    if (data.indexOf('Inferior') != -1) {
        process.exit(0);
    }
    cnt++;
});

childProcess.stdin.write('break main\n');
childProcess.stdin.write('run\n');

var n = 0;
while(n < 10000) {
    childProcess.stdin.write('step\n');
    childProcess.stdin.write('info locals\n');
    n++;
}

childProcess.stdin.write('q\n');
childProcess.stdin.end();