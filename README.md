# SSH Tunneling MySQL
[orm](https://github.com/dmin0211/web-server-was/blob/main/orm.js)
[connection pool](https://github.com/dmin0211/web-server-was/blob/main/ssh-mysql-connection.js)


# web-server-was

## nginx-initialize.sh
nginx 설치 및 ssl.sh, virtual-server.sh 실행하는 스크립트

## virtual-server.sh
nginx 가상 서버 설정 파일을 추가하는 스크립트

* ssl 인증서가 발급된 상태에서만 실행 가능(https 가상 서버 추가)

```js
./virtual-server.sh [Root Domain] [Sub Domain] [Upstream name] [Was Addresses]
```

- Root Domain : 인증서를 발급받은 도메인 주소만 가능함. 필수로 입력해야지 정상적으로 스크립트 실행
- Sub Domain : server 로 등록할 sub domain 입력.(Default "[sub_domain]")
- Upstream name : upstream name 으로 사용할 문자열 입력.(Default "[upstream_name]")
- Was Addresses : 로드 밸런싱할 was 주소들 입력. (Default "server [was_address]"-> 실행시 장애가 발생합니다.)

## ssl.sh
와일드카드 ssl 인증서 발급 스크립트
```js
./ssl.sh [Root Domain] [Email]
```
*실행 후 출력되는 문자열 2개를 DNS 설정 추가

```
 - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y
```
Yes 입력

```
Please deploy a DNS TXT record under the name
_acme-challenge.[root domain] with the following value:

[String]

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue
```

DNS TXT Record _acme-challenge 이름으로 [String] 값 추가 후 Enter 입력
<img width="1000" alt="Screen Shot 2021-09-22 at 4 45 43 PM" src="https://user-images.githubusercontent.com/74395748/134303166-16845e03-0747-48a9-90df-f097bde08533.png">



```
Please deploy a DNS TXT record under the name
_acme-challenge.[root domain] with the following value:

[String]

Before continuing, verify the record is deployed.
(This must be set up in addition to the previous challenges; do not remove,
replace, or undo the previous challenge tasks yet. Note that you might be
asked to create multiple distinct TXT records with the same name. This is
permitted by DNS standards.)

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue
```
_acme-challenge Record 에 String 추가 후 Enter 입력

<img width="995" alt="Screen Shot 2021-09-22 at 4 47 44 PM" src="https://user-images.githubusercontent.com/74395748/134303483-e1930211-409b-4c20-8d58-3615a4491a8d.png">

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/[root domain]/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/[root domain]/privkey.pem
   Your cert will expire on 2021-12-21. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```
성공 시 해당 인증서의 경로 메모
