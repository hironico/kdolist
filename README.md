
# K.DO-list application 

# runtime setup 
- Install nodejs
Run ./server/tools/installnodejs.sh 

# Setup of infrastructure
- Install podman 
sudo apt-get install podman

- Install podman desktop 
Either with flatpak or apt

- pull latest image for postgres 
use postresql 16+ or latest

- configure docker image 
Documentation here : https://hub.docker.com/_/postgres

Environment variables to set
POSTGRES_PASSWORD (mandatory)
PGDATA

Volume : map one data path to save pgdata

Sample docker/podman command:

$ docker run -d \
	--name some-postgres \
	-e POSTGRES_PASSWORD=mysecretpassword \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /custom/mount:/var/lib/postgresql/data \
	postgres


