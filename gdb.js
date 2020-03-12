const cp = require('child_process');

const childProcess = cp.spawn('gdb', [process.argv[2]]);

childProcess.stdout.setEncoding('utf8');
childProcess.stdout.on('error', function (err) { console.error(err); process.exit(1); });
childProcess.stdin.on('error', function (err) { console.error(err); process.exit(1); });

var stdout = "";
var cnt = 0;
childProcess.stdout.on("data", function (data) {
    if (cnt > 0) { stdout = stdout + data }
    if (data.indexOf("[Inferior") != -1) {
        console.log(stdout);
        process.exit(0);
    }
    cnt++;
});

childProcess.stdin.write('break main\n');
childProcess.stdin.write('run\n');

var n = 0;
while ( n < 10000) {
    childProcess.stdin.write('s\n');
    childProcess.stdin.write('info locals\n');
    n++;
}

childProcess.stdin.write('q\n');
childProcess.stdin.end();