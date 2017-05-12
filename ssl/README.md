```
openssl genrsa -des3 -out ca.key 1024
openssl req -new -key ca.key -out ca.csr
openssl x509 -req -days 3650 -in ca.csr -out ca.crt -signkey ca.key

openssl genrsa -des3 -out server.key 1024
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 3650 -in server.csr -out server.crt -signkey server.key
```
