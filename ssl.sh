#!/bin/bash

param_count=$#
main_domain=$1
email=$2

if [ ${param_count} -ne 2 ] 
then
	echo multiple domain
	exit 1; # only one domain
fi

if [[ $main_domain =~ ^[a-z][^\.]+(\.biz|\.com|\.info|\.name|\.net|\.org|\.pro|\.dev)$ ]]; then
	echo "valid doamin"
else
	echo "invalid domain"
	exit 2; # invalid domain format
fi

if [[ $email =~ ^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$ ]]; then
	echo "valid email"
else
	echo "invalid email"
fi

sudo apt install certbot
sudo certbot certonly --manual --preferred-challenges=dns --email $email --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d $main_domain -d *.$main_domain
