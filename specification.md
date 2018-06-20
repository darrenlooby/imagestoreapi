# Beyond - NodeJS Back End Test

At Beyond we absolutely love working with the latest technologies and take
great care in producing solid apps and user friendly, aesthetically pleasing
interfaces for our clients.

Before we get you in for a chat we would love to see you in action so have put
together a small task for you to showcase your coding skills. We would like you
to implement a simple image processing web API.

## Requirements

The application should provide endpoints for creating image objects in a
datastore, managing the objects in the datastore and providing new (resized)
renditions of existing image objects already present in the datastore.

### The technical requirements:

* NodeJS should be used as the web server.
* Data should be stored in a NoSQL based datastore.
* Security aspects should be taken into consideration.
* The application and the datastore should be deployed as Docker containers.
* Your submission should include run instructions to bootstrap the
  containerized application locally.
* Version control via a git repository.

### The functional requirements:

Your implementation should adhere the to OpenAPI 2.0 specification defined in
the `swagger.yaml` file in this repository. This definition can be summarized
as follows:

* As an authenticated user, I should be able to use a create and delete image
  objects in the datastore.
* As an anonymous user, I should be able view image objects via a public url.
* As an anonymous user, I should be able to get a resized rendition of existing
  image objects via a public url.

## Extra credit

If you have the time and inclination, here are some things you could implement
for extra credit.

* Caching of resized image renditions.
* Add additional image processing endpoints (eg rotate, grayscale, etc)
* Add pagination to the list image objects endpoint.
* Write a terraform module to provision an AWS environment to host the
  application, and a script to deploy the application to the environment.

## Resources

Here are some resources which may help get you started.

* https://github.com/OAI/OpenAPI-Specification/
* https://github.com/swagger-api/swagger-codegen
* http://eyalarubas.com/image-processing-nodejs.html
* https://www.npmjs.com/package/jimp
