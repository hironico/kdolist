
# K.DO-list application 

# Runtime setup 

The following runtimes are needed for kdolist to work.

## Nodejs
- Install nodejs
```
./server/tools/installnodejs.sh 
```

## Podman 

- Podman machine install

```sudo apt-get install podman```

- Install podman desktop 

Either with flatpak or apt

## Postresql 16+ or latest

Documentation here : https://hub.docker.com/_/postgres

Environment variables to set for postgres in container:

- POSTGRES_PASSWORD (mandatory)
- PGDATA = Volume : map one data path to save pgdata

Sample docker/podman command:

```
docker run -d \
	--name some-postgres \
	-e POSTGRES_PASSWORD=mysecretpassword \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /custom/mount:/var/lib/postgresql/data \
	postgres
```

## Keycloak (user federation)

Install Keycloak docker image as described in standard documentation

Environment variables to set for SSL to work with Keycloak : 

- KC_HTTPS_CERTIFICATE_FILE=/etc/x509/https/tls.crt
- KC_HTTPS_CERTIFICATE_KEY_FILE=/etc/x509/https/tls.key

Change path as you wish. Can be a folder mapped to a volume for easier 
management of certs (eg expiration). 

For production use let's encrypt certbot and point to the pem files using a podman volume.

# Trusted SSL certificates 

You need SSL to make it work with Keycloak IAM server.

## Development

Use ```mkcert``` to generate and trust self signed certifcates so that browser does not complain in development.
This allows to use a nodejs dev server (npm run dev) and a different vite development server (npm run dev) with different ports.

https://github.com/FiloSottile/mkcert/tree/master

```mkcert -install example.net localhost 127.0.0.1 ::1```

Will create and install in system trust store cert and key files. Reference these files inthe .env configuration options for server and keycloak (optional). 

## Production

Use let's encrypt with automatic renewal with certbot

Visit https://letsencrypt.org/

Change or remove the ```NODE_TLS_REJECT_UNAUTHORIZED="0"``` in server .env file.
