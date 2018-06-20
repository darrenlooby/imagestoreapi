export S3_ACCESS_KEY_ID = s3AccessKey
export S3_SECRET_ACCESS_KEY = s3SecretAccessKey
export S3_BUCKET_NAME = imagestore
export SWAGGER = ./swagger.yaml
export CONTROLLERS = ./controllers
export INGRESS_PORT = 3000

LOCAL_ENVIONMENT = APP_ROOT=http://localhost:3000/v1 \
	MONGO_CONNECTION=mongodb://localhost:27020 \
	S3LOCATION=http://localhost:4569 \
	S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} \
	S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} \
	S3_BUCKET_NAME=${S3_BUCKET_NAME} \
	SWAGGER=${SWAGGER} \
	CONTROLLERS=${CONTROLLERS} \
	INGRESS_PORT=${INGRESS_PORT} \

install:
	npm --prefix ./app install
	npm --prefix ./tests install

run-local-tests:
	${LOCAL_ENVIONMENT} \
	npm --prefix ./tests run test

run-local-api:
	${LOCAL_ENVIONMENT} \
	npm --prefix ./app run start

run-local-api-nodemon:
	${LOCAL_ENVIONMENT} \
	npm --prefix ./app run nodemon

docker-local: docker-down
	docker-compose --file docker-compose.yml --file docker-compose-api.yml up -d --build

docker-dev: docker-down
	docker-compose --file docker-compose.yml up -d --build

docker-run-test: docker-down
	docker-compose --file docker-compose.yml --file docker-compose-api.yml --file docker-compose-test.yml up --build image-api-test

docker-down:
	docker-compose down --remove-orphans -v
