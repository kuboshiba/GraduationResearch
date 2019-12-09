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

## Install Docker ( for Ubuntu18.04 )
<pre>
$ sudo apt update
$ sudo apt install -y \
     apt-transport-https \
     ca-certificates \
     curl \
     software-properties-common
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
$ sudo add-apt-repository \
     "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) \
     stable"
$ sudo apt update
$ sudo apt install -y docker-ce
$ sudo gpasswd -a YOUR_USERNAME docker ※大文字は自身のユーザー名
$ sudo chmod 666 /var/run/docker.sock
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
