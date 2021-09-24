#!/bin/bash

if [ ! -f /etc/nginx/nginx.conf ]; then
	sudo apt-get install nginx; 
fi

if [ ! -d "/etc/letsencrypt/live/$1" ]; then
	echo ssl certificate not exist;
	./ssl.sh $1 $2;
	ssl_result= $?
else
	echo ssl certificate exist;
	ssl_result= 0;
fi

if [ $ssl_result -ne 0 ]; then
	echo ã…certificate issuance error;
	exit 3;
fi;

./virtual-server.sh $1;
