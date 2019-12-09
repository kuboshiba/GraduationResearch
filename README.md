# GraduationResearch
## Environment
<pre>
$ cat /etc/issue
Ubuntu 18.04.3 LTS \n \l

$ docker --version
Docker version 19.03.2, build 6a30dfc

$ npm --version
3.5.2

$ node --version
v8.10.0
</pre>

## Setup
<pre>
$ cd ~/
$ mkdir Git
$ cd Git
$ git clone https://github.com/kuboshiba/GraduationResearch.git
$ cd GraduationReserch
$ cd image-ubuntu-dev
$ docker build -t ubuntu-dev .
$ cd ../image-node-dev
$ docker build -t node-dev .
$ cd ../node
$ docker run -v $HOME/Git/GraduationResearch/node:$HOME/Git/GraduationResearch/node -v /usr/local/bin/docker:/usr/local/bin/docker -v /usr/bin/docker:/usr/bin/docker -v /var/run/docker.sock:/var/run/docker.sock -w $HOME/Git/GraduationResearch/node -p 3000:3000 --rm -i -t node-dev /bin/bash

root@docker-hostname $ node app.js
</pre>

ブラウザで http://localhost:3000 にアクセスしてください
