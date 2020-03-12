# Kvolt
> 変数値の可視化によるプログラミング学習の理解支援するツール

## 動作環境（確認済み）
本ツールはDockerをインストールしているOSで動作する

- OS
  - Ubuntu 16.04
  - MacOS Catalina 10.15.x

## 導入手順
```
$ cd ~
$ git clone https://github.com/kuboshiba/GraduationResearch
$ cd GraduationResearch
$ sudo python3 setup.py
$ docker run -it --rm --cap-add=SYS_PTRACE --security-opt="seccomp=unconfined" -v $HOME/GraduationResearch/:/root/Workspace -v /usr/local/bin/docker:/usr/local/bin/docker -v /usr/bin/docker:/usr/bin/docker -v /var/run/docker.sock:/var/run/docker.sock -w /root/Workspace -p 3000:3000 server-cent

[root@コンテナID Workspace]# node app.js
```
http://localhost:3000
もしくは
http://IPアドレス:3000
にアクセスしてください
