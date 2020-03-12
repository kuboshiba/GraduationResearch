const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const child_process = require('child_process');
const cp = require('child_process');
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    for(var i = 0; i < numCPUs; i++) {
        console.log(`Master : Cluster Fork ${i}`);
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.warn(`[${worker.id}] Worker died : [PID ${worker.process.pid}] [Signal ${signal}] [Code ${code}]`);
        cluster.fork();
    });
}
else {
    console.log(`[${cluster.worker.id}] [PID ${cluster.worker.process.pid}] Worker`);

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
            '--memory=10m --memory-swap=60m ' +
            '--ulimit nproc=10:10 ' +
            '--ulimit fsize=1000000:1000000 ' +
            '-w /workspace ' +
            'gcc-dev ' +
            '/usr/bin/time -q -f "%e" -o /time.txt ' +
            'timeout 3 ' +
            'su nobody -s /bin/bash -c "' +
            execCmd +
            '"';
    
        // console.log("Running: " + dockerCmd);
        var containerId = child_process.execSync(dockerCmd).toString().substr(0, 12);
        // console.log("ContainerId: " + containerId);
    
        // Copy the source code to the container
        child_process.execSync('rm -rf /tmp/workspace && mkdir /tmp/workspace && chmod 777 /tmp/workspace');
        fs.writeFileSync('/tmp/workspace/' + filename, source_code);
        dockerCmd = "docker cp /tmp/workspace " + containerId + ":/";
        // console.log("Running: " + dockerCmd);
        child_process.execSync(dockerCmd);
    
        // Start the container
        dockerCmd = "docker start -i " + containerId;
        // console.log("Running: " + dockerCmd);
        var child = child_process.exec(dockerCmd, {}, function (error, stdout, stderr) {
            // Copy time command result
            dockerCmd = "docker cp " + containerId + ":/time.txt /tmp/time.txt";
            // console.log("Running: " + dockerCmd);
            child_process.execSync(dockerCmd);
            var time = fs.readFileSync("/tmp/time.txt").toString();
    
            // Remove the container
            dockerCmd = "docker rm " + containerId;
            // console.log("Running: " + dockerCmd);
            child_process.execSync(dockerCmd);
    
            console.log("[ Result ]\n", stdout);
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

    var FileCount = 0;
    app.post('/api/debug', function (req, res) {
        var filename = String(FileCount) + ".c";
        fs.writeFileSync(filename, req.body.source_code);

        var cmd = "gcc -g -O0 -o " + String(FileCount) + " " + filename;
        cp.exec(cmd, {}, function (error, stdout, stderr) { if (error != null) console.log(error); });
        
        cp.exec("node gdb.js " + String(FileCount), {}, function (error, stdout, stderr) {
            if (error != null) console.log(error);
            var rejson = JSON.stringify(stdout);
            try {
                fs.unlinkSync(String(FileCount));
                fs.unlinkSync(String(FileCount) + ".c");
            } catch (error) {
                throw error;
            }
            FileCount++;
            res.send(rejson);
        });
    });
  
    app.listen(3000, function () {
        console.log('Listening on port 3000');
    });
}
