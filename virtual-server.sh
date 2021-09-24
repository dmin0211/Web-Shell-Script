#!/bin/bash

domain_name=$1;
shift;
sub_domain_name=$1;
shift;
upstream_name=$1;
shift;
was_content="\tserver [was_address];\n";

if [ ! $sub_domain_name ]; then
	sub_domain_name="[sub_domain]";
fi;
server_name="$sub_domain_name.$domain_name";
if [ ! $upstream_name ]; then
	upstream_name="[upstream_name]";
fi;
if [ $# -ne 0 ]; then
	was_content="";
fi;

while [ $# -ne 0 ]
do
	was_content="$was_content\tserver $1;\n";
	shift;
done;

if [ ! -d "/etc/letsencrypt/live/$domain_name" ]; then
	echo a valid ssl certificate does not exist;
	exit 4;
fi

upstream="upstream $upstream_name {\n$was_content}\n";

http_server_block="server {\n\tserver_name $server_name;\n\treturn 301 https://$server_name\$request_uri;\n}\n";

ssl_certificate_content="\tssl_certificate /etc/letsencrypt/live/$domain_name/fullchain.pem;\n\tssl_certificate_key /etc/letsencrypt/live/$domain_name/privkey.pem;\n\tssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;\n\tinclude /etc/letsencrypt/options-ssl-nginx.conf;";

root_location_block="\tlocation / {\n\t\tinclude /etc/nginx/proxy_params;\n\t\tproxy_pass http://$upstream_name;\n\t\tproxy_set_header Upgrade \$http_upgrade;\n\t\tproxy_set_header Connection \"upgrade\";\n\t\tproxy_ssl_server_name on;\n\t\tproxy_intercept_errors on;\n\t\tproxy_redirect off;\n\t}\n";

error_page="\terror_page 404 500 502 503 504 /error-page.html;\n\tlocation =/error-page.html {\n\t\troot /var/www/html;\n\t\tinternal;\n\t}\n";

https_server_block="server {\n\tlisten 443 ssl;\n\tserver_name $server_name;\n$ssl_certificate_content\n$root_location_block\n$error_page\n}\n";
echo -e "$upstream\n$http_server_block\n$https_server_block" > "/etc/nginx/sites-available/$server_name";

sudo ln -s "/etc/nginx/sites-available/$server_name" /etc/nginx/sites-enabled;
