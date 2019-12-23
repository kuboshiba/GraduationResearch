var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var child_process = require('child_process');
var cp = require('child_process');
var fs = require('fs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/run', function (req, res) {
    var language = req.body.language;
    var source_code = req.body.source_code;
    var input = req.body.input;

    var filename, execCmd;

    if (language === 'ruby') {
        filename = 'Main.rb';
        execCmd = 'ruby Main.rb';
    } else if (language === 'python') {
        filename = 'Main.py';
        execCmd = 'python3 Main.py';
    } else if (language === 'c') {
        filename = 'Main.c';
        execCmd = 'gcc -o Main Main.c && ./Main';
    }

    // Create a container
    var dockerCmd =
        'docker create -i ' +
        '--pids-limit 10 ' +
        '--net none ' +
        '--cpuset-cpus=0 ' +
        '--memory=512m --memory-swap=512m ' +
        '--ulimit nproc=10:10 ' +
        '--ulimit fsize=1000000:1000000 ' +
        '-w /workspace ' +
        'ubuntu-dev ' +
        '/usr/bin/time -q -f "%e" -o /time.txt ' +
        'timeout 3 ' +
        'su nobody -s /bin/bash -c "' +
        execCmd +
        '"';

    console.log("Running: " + dockerCmd);
    var containerId = child_process.execSync(dockerCmd).toString().substr(0, 12);
    console.log("ContainerId: " + containerId);

    // Copy the source code to the container
    child_process.execSync('rm -rf /tmp/workspace && mkdir /tmp/workspace && chmod 777 /tmp/workspace');
    fs.writeFileSync('/tmp/workspace/' + filename, source_code);
    dockerCmd = "docker cp /tmp/workspace " + containerId + ":/";
    console.log("Running: " + dockerCmd);
    child_process.execSync(dockerCmd);

    // Start the container
    dockerCmd = "docker start -i " + containerId;
    console.log("Running: " + dockerCmd);
    var child = child_process.exec(dockerCmd, {}, function (error, stdout, stderr) {
        // Copy time command result
        dockerCmd = "docker cp " + containerId + ":/time.txt /tmp/time.txt";
        console.log("Running: " + dockerCmd);
        child_process.execSync(dockerCmd);
        var time = fs.readFileSync("/tmp/time.txt").toString();

        // Remove the container
        dockerCmd = "docker rm " + containerId;
        console.log("Running: " + dockerCmd);
        child_process.execSync(dockerCmd);

        console.log("Result: ", error, stdout, stderr);
        res.send({
            stdout: stdout,
            stderr: stderr,
            exit_code: error && error.code || 0,
            time: time,
        });
    });

    child.stdin.write(input);
    child.stdin.end();
});

app.post('/api/gdb', function (req, res) {
    var source_code = req.body.source_code;

    fs.writeFileSync("main.c", source_code);
    cp.exec("cat test.c", {}, function (error, stdout, stderr) {
        console.log(stdout);
    });
    cp.exec("gcc -g main.c", {}, function (error, stdout, stderr) {
        if (error != null) {
            console.log(error);
        }
    });

    var cnt = 0;
    var result = "";
    var flag = false;

    var childProcess = cp.spawn('gdb', ['./a.out']);
    childProcess.stdout.setEncoding('utf8');

    childProcess.stdout.on("data", function (data) {
        if (flag == false) console.log(data);
        if (cnt > 6) result = result + data;
        cnt++;
        if (flag == false && (data.indexOf('Inferior') != -1)) {
            var rejson = JSON.stringify(result);
            res.send(rejson);
            flag = true;
        }
    });

    childProcess.stdout.on('error', function (err) {
        console.error(err);
        process.exit(1);
    });

    childProcess.stdin.on('error', function (err) {
        console.error(err);
        process.exit(1);
    });

    var n = 0;
    childProcess.stdin.write('break main\n');
    childProcess.stdin.write('run\n');

    while (n <= 1000) {
        n++;
        childProcess.stdin.write('step\n');
        childProcess.stdin.write('info locals\n');
    }
    childProcess.stdin.end();

    if (flag == false) console.log("flag is false");
});

var FileCount = 0;
function CompileForGDB(source_code) {
    var filename = String(FileCount) + ".c";
    fs.writeFileSync(filename, source_code);

    var cmd = "gcc -g -O0 -o " + String(FileCount) + " " + filename;
    FileCount++;
    cp.exec(cmd, {}, function (error, stdout, stderr) { if (error != null) console.log(error); });
    return String(FileCount-1);
}

// app.post('/api/debug', function (req, res) {
//     var info_array = JSON.parse(req.body.array);
//     var filenum = CompileForGDB(req.body.source_code);

//     var childProcess = cp.spawn('gdb', [String(filenum)]);
//     childProcess.stdout.setEncoding('utf8');
//     childProcess.stdout.on('error', function (err) { console.error(err); process.exit(1); });
//     childProcess.stdin.on('error', function (err) { console.error(err); process.exit(1); });

//     var stdout = "";
//     var cnt = 0;

//     childProcess.stdout.on("data", function (data) {
//         if (cnt > 6) { console.log(data); stdout = stdout + data }
//         if (data.indexOf('Inferior') != -1) {
//             var rejson = JSON.stringify(stdout);
//             res.send(rejson);
//             process.exit(0);
//         }
//         cnt++;
//     });

//     childProcess.stdin.write('break main\n');
//     childProcess.stdin.write('run\n');

//     var n = 0;
//     while(n < 1000) {
//         childProcess.stdin.write('step\n');
//         childProcess.stdin.write('info locals\n');
//         n++;
//     }

//     childProcess.stdin.write('q\n');
//     childProcess.stdin.end();

//     // var cmd = "python3 RemoveFile.py " + filenum;
//     // cp.exec(cmd, {}, function (error, stdout, stderr) { console.log(stdout); });
// });

app.post('/api/debug', function (req, res) {
    var info_array = JSON.parse(req.body.array);
    var cmd_array = "";
    for (var i=0; i<info_array.length; i++) {
        cmd_array = cmd_array + info_array[i].name + ":" + info_array[i].len + " ";
    }
    console.log(cmd_array);
    var filenum = CompileForGDB(req.body.source_code);
    var execCmd = "node gdb.js " + String(filenum) + " " + String(info_array.length) + " " + cmd_array;

    // Create a container
    var dockerCmd =
        'docker create -it ' + 
        '-v /Users/kbt_hrk/Git/GraduationResearch/node:/Users/kbt_hrk/Git/GraduationResearch/node ' +
        '-w /Users/kbt_hrk/Git/GraduationResearch/node ' +
        'centos-dev ' + 
        'su nobody -s /bin/bash -c "' +
        execCmd +
        '"';

    
    console.log("\nRunning: " + dockerCmd);
    var containerId = child_process.execSync(dockerCmd).toString().substr(0, 12);
    console.log("ContainerId: " + containerId);

    dockerCmd = "docker start -i " + containerId;
    console.log("Running: " + dockerCmd);

    cp.exec(dockerCmd, {}, function (error, stdout, stderr) {
        if (error != null) console.log(error);
        var rejson = JSON.stringify(stdout);
        // Remove the container
        dockerCmd = "docker rm " + containerId;
        console.log("Running: " + dockerCmd);
        child_process.execSync(dockerCmd);
        res.send(rejson);
    });


});

app.listen(3000, function () {
    console.log('Listening on port 3000');
});