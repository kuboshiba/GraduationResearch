import subprocess
cmd_list = ["docker build -t server-cent docker/server-cent",
            "docker build -t gcc-dev docker/gcc-dev"]

for i in range( len(cmd_list) ):
    subprocess.call(cmd_list[i].split())
