# Glints Technical Assigment (Backend) - Buying Frenzy

Table of contents:

- Overview
- Database Schema Documentation
- Complete API Documentation
- Main Operations Approach & Remarks
- How To Run
- Testing

## Overview

Complete functional backend application created using NodeJS and NestJS Framework.

TODO

## Database Schema Documentation

TODO

## Complete API Documentation

### `[POST] /sso/register/`

Register (create) new user, need unique name and password.
Return 201 if success, with the signed access token.
Return 400 if it does not satisfy dto constraint.
Return 409 if conflict (no duplicate name allowed).

### `[POST] /sso/login/`

Login with name and password.
Return 200 if success, with the signed access token.
Return 400 if it does not satisfy dto constraint.
Return 401 unauthorized if name or password is wrong.

### `[GET] /sso/user/`

Get profile info (id, name, email, cashBalance) of the requesting user.
Return 200 if success, with profile information.
Return 401 if not logged in.

### `[PUT] /sso/user/`

Allows you to change your password and email, given old password.
Return 200 if success.
Return 400 if it does not satisfy dto constraint.
Return 401 if not logged in, or if password does not match.

### `[DELETE] /sso/user/`

Given user name and correct password, delete the account.
Return 204 if success.
Return 400 if it does not satisfy dto constraint.
Return 401 if not logged in, or if password does not match.

### `[POST] /sso/user/topup/`

Topup (increase) the cash balance of a user.
Note: realistically, you should integrate this with 3rd party API to make payment
For the sake of this sample, it is assumed you already make the necessary payment
Increase current user cashBalance by 'additionalCashBalance'
Return 201 if topup success.
Return 400 if body does not satisfy dto constraint.
Return 401 if not logged in.

### `[GET] /restaurant/`

Get all restaurants without its menu list, with filter and pagination.
Query Params:

- datetime (format DD/MM/YYYY/HH:MM): filter restaurant that are open at that datetime
- itemsperpage (positive integer): returns 'itemsperpage' restaurants (pagination), by default 10, returning all restaurant at once is too heavy
- page (positive integer): display page number 'page', by default 1
- pricelte (non-negative number): 'price less than or equal to' filter, default 999999 (arbirary large num)
- pricegte (non-negative number): 'price greater than or equal to' filter, default 0
- dishlte (positive integer): 'dish count less than or equal to' filter, default 1000 (arbirary large)
- dishgte (positive integer): 'dish count grater than or equal to' filter, default 1
- sort (boolean): sort alphabetically if true, default false

Return 200 if success, with pagination info (total pages, whether next/prev page exist)
Return 400 if any optional query params format is invalid.

### `[GET] /restaurant/search/`

Requires 'q' query parameter for search query, optional pagination similar to above.
Get restaurants in descending order or relevance (by Jaro Winkler algo).
Return 200 if success, with relevance for each restaurant & pagination info.
Return 400 if any optional query params format is invalid.

### `[POST] /restaurant/`

Create a new restaurant instance, cashBalance defaulted to 0, the user who makes the request becomes the restaurant owner (user).
Return 201 if success, with the new created instance.
Return 401 if not logged in.
Return 400 if it does not satisfy dto constraint.
Return 409 if conflict (same restaurantName).

### `[GET] /restaurant/:id/`

Get a restaurant instance (including all menu), given its id.
Return 200 if success, with the restaurant instance and all menu in that restaurant.
Return 404 if instance not found (invalid id).

### `[POST] /restaurant/:id/`

Create a menu with a foreign key to a restaurant instance.
Return 201 if success, with the new created instance.
Return 401 if not logged in.
Return 400 if it does not satisfy dto constraint.
Return 403 if not restaurant owner.
Return 404 if instance not found (invalid id).

### `[PUT] /restaurant/:id/`

Update existing restaurant instance, given its id.
Return 200 if success, with the new updated instance.
Return 401 if not logged in.
Return 400 if it does not satisfy dto constraint.
Return 403 if not restaurant owner.
Return 404 if instance not found (invalid id).

### `[DELETE] /restaurant/:id/`

Delete existing restaurant instance, given its id.
Return 204 if success.
Return 401 if not logged in.
Return 404 if instance not found (invalid id).
Return 403 if not restaurant owner.

### `[PUT] /restaurant/:id/`

Update existing menu instance, given its id.
Return 200 if success, with the new updated instance.
Return 401 if not logged in.
Return 400 if it does not satisfy dto constraint.
Return 403 if not restaurant owner of current dish.
Return 404 if instance not found (invalid id).

### `[DELETE] /menu/:id/`

Delete existing menu instance, given its id.
Return 204 if success, with the new created instance.
Return 401 if not logged in.
Return 404 if instance not found (invalid id).
Return 403 if not restaurant owner of current dish.

### `[POST] /purchase/`

Create multiple purchases at once, requires a list of (menuId-quantity) object.
Add appropriate cash balance to restaurant, decrease from user.
Return 201 if success, with the purchase instances created.
Return 401 if not logged in.
Return 400 if it does not satisfy dto constraint, or if store currently closed.
Return 404 if any of the menuId is invalid.
Return 402 if cash balance insufficient.

### `[POST] /sample/populate/`

Populate database with given sample data.
It is an async function, it will run for a few seconds after you get the response.

### `[DELETE] /sample/reset/`

Delete all data in the database.
Note that it does not reset the id count back to 1 again.
It is an async function, it will run for a few seconds after you get the response.

## Main Operations Approach & Remarks

TODO

## How To Run

1. Clone the repository, make sure you have node (v18.x is recommended) installed, and prefarably yarn as package manager

2. Install all dependencies with `yarn install`

3. Run database using docker with the command `docker compose up db` (by default setup at port 5432)

4. Install prisma cli, then you can type `npx prisma migrate dev` to makemigrations and migrate changes to the database

5. Type `yarn start` to start main server, by default hosted in port 3000, or you can run `yarn start:dev` to watch for changes and automatically restart the server if there are any changes

6. Using postman or other similar tools, you can create a POST request to the endpoint: `/sample/populate/`, which will automatically populate your database. Please do this only ONCE, it should take up to a minute (the process is asynchronous, even if you have received the response, the database population should take a moment)

7. You can run `npx prisma studio` to host an admin page with UI to view and navigate through the database, by default hosted in port 5555

8. Type `yarn test` to run all test cases, or you can try manually requesting the APIs

## Testing

TODO - put testing results here
