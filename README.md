# Image Store API

This is Image Store API; a scaffold image store and mutation service.

### What it does

At present it is a cluster of 4 services, each in a Docker Container.

* Image API
* S3 Mock
* Mongo
* Test Suite

##### Image API

The Image API accept POST request to store images - with Basic Auth limiting access.

When an image is uploaded the API calculates the height and width, accepts the name, generates a URL to access the image; and creates some meta that is used by the API internally - all of which is stored in Mongo.

GET requests can then be made to list images and recover their URLs - which is an address to an item in either s3 or a mock thereof.

Each image is given a unique ID - which becomes a partition key to any cached items, as well as a simple method of ensuring file name clashes do not occur.

The original image is stored in S3 along with its dimensions as part of it's path key. Later, if a mutated version is created an additional path key is created with differing dimensions. The database keeps a record only of the original image.

* example of an original key: *c571ae4e-11ee-4b26-ad1e-8ccc88e0cb3a/countryside-**640x344**.jpg* (tracked in database)
* example of a cached key: *c571ae4e-11ee-4b26-ad1e-8ccc88e0cb3a/countryside-**200x200**.jpg* (only stored in s3 or mock)

If an image is then later deleted, then all of its mutated cache versions of removed - by deleting all images that begin with the partition key.

##### S3 Mock

The S3 Mock is based on [s3erver](https://www.npmjs.com/package/s3rver) and is simply wrap in a docker container.

##### Mongo

The official Mongo Docker Image.

##### Test Suite

The Test Suite is a Docker Container wrapping a Mocha test. It is managed with `docker-compose-test.yml`.

### How To

##### Test

In order to run the tests, run the command ```make docker-run-test```.

This will use Docker Compose and merge the general set of services with the Test Suite.

The tests run at integration level - after resetting the data in each service. The test then proceeds to upload files and then finally resize. It includes tests for files that are not allowed, as well as tests for authentication or lack thereof.

##### Develop

*Structure*:

The projects is structured as follows:

Root folder holds git, docker compose, make, lint, and \*.md files.

Three main folders

* /app contains the actual app
* /s3 contains the s3 mock server
* /tests contains the test suite

Each of these folders is home to their own node_modules and Dockerfile - though, s3 needn't be interfared with as compose picks that up in all scenarios.

You can work from each of the /app and /tests folders - but the project is set up so that you don't need to move out of its root.

The command ```make install``` will install the node modules required outside of composed services.

In order to run the API without contained tests - run ```make docker-local``` this will enable you to run the tests directly so that more coverage can be created, or new features can be added in TDD strategy.

In order to run the dependant services in the background and the API directly, run ```make docker-dev```. This will enable you to use *Nodemon* etc to keep the app active for development.

Both of these commands will run the collection of services as daemons - so use ```make docker-down``` if you'd like to stop them all.

If you want to run the application directly, you can use the following:

```make run-local-api``` or ```make run-local-api-nodemon```

In order to run the tests with a direct setup, run ```make run-local-tests```.


Use ```docker logs {container} -f``` to view the logs of a running server during development.

### TODO

* Update Basic Auth to a better method of authentication
* Change the IDs to something more fitting, an incrementing counter isn't ideal
* Offer the deletion of cached versions without effecting the original image
* Add tests for 100% coverage of different filetypes
* Update the health endpoint of the API to cover downstream dependancies
* Update the delete strategy to accept a roundtrip to database for more comprehensive delete - rather than soft delete from db
* Product structured user errors from custom error objects

### Notes

* The Swagger file has had some minor alterations to allow for the use of [Swagger Tools](https://github.com/apigee-127/swagger-tools) by use of the **x-swagger-router-controller** property
* Other alterations include the addition of mime-types and a **/ping** health endpoint
* Linting follows ESLint - airbnb
* The project includes custom extensions of the Error object to offer differentiation of error types
* In order to aide local development, each of the services have exposed ports to the local network - this might cause port conflict
