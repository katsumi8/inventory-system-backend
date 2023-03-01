- controllers
  which will house all the controllers needed for the application. These controller methods get the request from the routes and convert them to HTTP responses with the use of any middleware as necessary.
  Naming of files- xxxxx.controller.ts

- middlewares
  This folder will segregate any middleware needed for the application in one place. There can be middleware for authentication, logging, or any other purpose. For example, Validation to request and authority check.
  Naming of files- xxxxx.middleware.ts

- routes
  This folder that will have a single file for each logical set of routes. For example, there can be routes for one type of resource. It can be further broken down by versions like v1 or v2 to separate the route files by the version of the API.
  Naming of files- xxxxx.routes.ts

- services
  This folder will include all the business logic. It can have services that represent business objects and can run queries on the database. Depending on the need, even general services like a database can be placed here. For example, dealing with product purchase, calculating cart, managing customer information, task management, project management
  Naming of files- xxxxx.service.ts

- utils
  This directory that will have all the utilities and helpers needed for the application. It will also act as a place to put shared logic, if any. For example, a simple helper to calculate the offset for a paginated SQL query can be put in a helper.util.js file in this folder.
  Naming of files- xxxxx.util.ts
# inventory-system-backend
