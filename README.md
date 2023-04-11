# Glints Technical Assigment (Backend) - Buying Frenzy

Table of contents:

- Overview
- Complete API Documentation
- Testing Coverage
- How To Run

## Overview

This is a complete functional backend application created using NodeJS & 100% Typescript, with complete endpoints to navigate through all data, with JWT authentication, testing covering all endpoints, and achieving the required functionality needed to be supported by frontend.

### Tech Stack

I used NestJS Framework, integrated with Prisma ORM (Object Relational Mapper) to connect to underlying PostgreSQL. During development, use Docker volumes to setup and store data.

### Requirement Remarks

Here are some of my comments to fulfill the requirement as prompted:

> The task is to build an API server, with documentation and a backing relational database that will allow a front-end client to navigate through that sea of data easily, and intuitively. The front-end team will later use that documentation to build the front-end clients. We'd much prefer you to use Node.js (Typescript is a bonus!), as that is what we use at Glints.

API server and backing relational database completely running (see deployment section below for more details). Documentation is done manually here in README.md. Some options like Swagger automated documentation could also be an option (I used it with Django REST Framework on my past projects). All the endpoints preety much cover all functionality that I'd imagine intuitively possible (for example: top up cashBalance for user, get purchases made by user, etc.; refer to API docs below for the complete details). In real projects, of course I'd have to closely work together with the frontend team or see the UI/UX design to know what endpoints need to be created and the specific implementation details; here I am creating some of the endpoints just based on what I'd imagine the frontend might be.

> List all restaurants that are open at a certain datetime
> List top y restaurants that have more or less than x number of dishes within a price range, ranked alphabetically. More or less (than x) is a parameter that the API allows the consumer to enter.

These are implemented in the endpoint `[GET] /restaurant/` (see below documentation for more details); you can achieve this by customizing the query parameters.

> Search for restaurants or dishes by name, ranked by relevance to search term

I used a simple algorithm for this, refer to the endpoint `[GET] /restaurant/search/` for more details.

> Process a user purchasing a dish from a restaurant, handling all relevant data changes in an atomic transaction. Do watch out for potential race conditions that can arise from concurrent transactions!

Refer to the endpoint `[POST] /purchase/`, potential race conditions is resolved by optimistic locking to prevent conflicts.

### Deployment

The deployed version is available [here](http://glints-backend-assignment.ap-southeast-1.elasticbeanstalk.com/). It is deployed using AWS Elastic Beanstalk, using RDS free tier to host the PostgreSQL. Currently, it is still http as I didn't issue a certificate yet or setup a custom DNS yet (as this is just a sample application). I put this README.md as a pdf on AWS S3 (to be linked from my application).

### Security Remarks

This sample application is not set up to be invulnerable to security issues yet. Some of the current vulnerabilities include:

- Database is made 100% public and it allows connection from any host in Singapore (AWS ap-southeast-2)
- Backend has no CORS setup yet, meaning that any application can access the API, which mostly not the case at all (you only want some trusted host to access your API)
- CSRF issue (usually you want some middleware to handle this)
- Throttling or rate limiting might be required to prevent DDoS attack
- Hide sensitive information in environment variables instead (e.g., secret string used to sign jwt token, database password)

## Complete API Documentation

### Database Schemas

1. Restaurant

- **id** (Integer, Primary Key Autoincrement)
- **cashBalance** (Decimal 2dp): cash gained by the restaurant, by default is zero when new restaurant is created, increases accordingly as user made new purchase
- **openingHours** (String, format: `HH:MM/HH:MM/.../HH:MM`)
  - There should be exactly 14 HH:MM, seperated by delimeter '/'
  - The first HH:MM represents opening hour on Monday, second HH:MM represents closing hour on Monday, third represents opening hour on Tuesday, and so on, until the last represents closing hour on Sunday
  - HH:MM should be in 24 hours format, and should be a valid time
  - For example, the string `10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45` means that the store is open at:
    - Monday, Tuesday: 10:00 - 21:00
    - Wednesday, Friday: 09:45 - 18:45
    - Thursday: Closed entirely
    - Saturday: 11:00 - 23:30
    - Sunday: 10:15 - 19:45
- **restaurantName** (String): name of the restaurant (\*I wanted to make this name unique, but it seems some sample data violated the constraint, so I removed the unique attribute)
- **ownerId** (Integer, FK to User): foreign key to User, stores the id of the User model who created the restaurant, by default the account (has to be logged in) who created the restaurant be the owner; for the sample restaurant data given, I created a sample user and assign that user as the owner of all sample data

2. User

- **id** (Integer, Primary Key Autoincrement)
- **cashBalance** (Decimal 2dp): balance owned by the user, by default is zero when account is created, user able to top up using an endpoint, balance decrease accordingly when making purchases
- **name** (String, unique): unique username to identify every user
- **password** (String): store the hashed password, for sample purpose there is no constraint regarding strength of the password (e.g., password of `123` is too weak and shouln't be allowed, but we bypass that in this example for the sake of easy testing)
- **email** (String, optional): store an email (made optional here, can be left empty/null)

3. Menu

- **id**(Integer, Primary Key Autoincrement)
- **dishName** (String, unique on each restaurant): name of the dish, no duplicate dish allowed in the same restaurant
- **price** (Decimal 2dp): price of one instance of this menu
- **restaurantId** (Integer, FK to Restaurant): foreign key to Restaurant, indicating that this menu belongs to the restaurant with this id

4. PurchaseHistory

- **id**(Integer, Primary Key Autoincrement)
- **transactionDate** (DateTime): by default current date time of creation, date and time of when the transaction takes place
- **menuId** (Integer, FK to Menu): each purchase can be associated to one menu instance, meaning that the user purchase this menu
- **userId** (Integer, FK to User): the user who buy or made the purchase; when making purchases, user will be charged the price of this menu, and the balance will be added to the appropriate restaurant

Remarks:

- All foreign key here uses 'cascade' when deletion; this means that if the foreign key associated with an instance is deleted, then the instance will also be deleted (for example: if the restaurant is deleted, all associated menu that stores that restaurantId as a foreign key will also be deleted); _this might not be the best case everytime, it's best to adjust based on your needs (e.g., set to null instead, or do not allow deletion): for example when user delete their account, still store all transaction history but set it to null; alternatively, you can pretend to delete the account by having a active/deactivated status, but do not actually delete it from the database_

### `[POST] /sso/register/`

Explanation:

- Register (create) new user
- Request body: name, password, email (optional)
- Return 201 if success, with the signed access token
- Return 400 if it does not satisfy dto constraint (e.g., missing name / password, invalid email) \*_(note: for this simple example and for easiness of testing with password 123, I do not check for password strength, but in real application it should be enforced)_
- Return 409 if conflict (no duplicate name allowed)

Sample Input:

    {
        "name": "new user",
        "password": "12345678",
        "email": "someemail@mail.com"
    }

Sample Output:

    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ1MjUsIm5hbWUiOiJuZXcgdXNlciIsImlhdCI6MTY4MDg3OTIyMywiZXhwIjoxNjgwODgyODIzfQ.rPx18dj94Py_pWFmxZtDyJvYLlXEn3X38tAT5JdT8zA"
    }

### `[POST] /sso/login/`

Explanation:

- Login functionality using jwt \*_(for this simplistic example, it only return access token, not with refresh token; this approach here might raise some security concerns so it is not recommended in real practice)_
- Request body: name, password
- Return 200 if success, with the signed access token
- Return 400 if it does not satisfy dto constraint (e.g., missing name or password)
- Return 401 if user with that name does not exist or password incorrect

Sample Input:

    {
        "name": "new user",
        "password": "12345678"
    }

Sample Output:

    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ1MjUsIm5hbWUiOiJuZXcgdXNlciIsImlhdCI6MTY4MDg3OTIyMywiZXhwIjoxNjgwODgyODIzfQ.rPx18dj94Py_pWFmxZtDyJvYLlXEn3X38tAT5JdT8zA"
    }

### `[GET] /sso/user/`

Explanation:

- Get profile info (id, name, email, cashBalance) of the requesting user \*_(for this purpose, I assume that you cannot see other's people profile and can only see your own)_
- Return 200 if success, with profile information
- Return 401 if not logged in (no bearer token in authorization headers, or invalid bearer token, or token has expired)

Sample Output:

    {
        "id": 4554,
        "cashBalance": "0",
        "name": "new user",
        "email": null
    }

### `[PUT] /sso/user/`

Explanation:

- Allows you to change your password and/or email, given old password and name
- Request body: name, password (need to match with current password), newPassword (optional, if you want to change your password), email (optional, if you want to change your email)
- Return 200 if success, with the newly modified information (obviously without the password)
- Return 400 if it does not satisfy dto constraint (e.g., missing name or password, invalid email format)
- Return 401 if not logged in, or if password (when hashed) does not match with existing one in database

Sample Input:

    {
        "name": "new user",
        "password": "12345678",
        "newPassword": "1234567",
        "email": "newemail@mail.com"
    }

Sample Output:

    {
        "id": 4554,
        "cashBalance": "0",
        "name": "new user",
        "email": "newemail@mail.com"
    }

### `[DELETE] /sso/user/`

Explanation:

- Delete your own (requesting user's) account, need to verify name and password
- Request body: name, password
- Return 204 if success, user instance deleted (all purchases related to it will also be deleted, as I set 'cascade' when on delete)
- Return 400 if it does not satisfy dto constraint (e.g., missing name or password)
- Return 401 if not logged in, or if password does not match.

Sample Input:

    {
        "name": "new user",
        "password": "1234567"
    }

Sample Output: -

### `[POST] /sso/user/topup/`

Explanation:

- Top up (increase) the cash balance of a user \*_(Note: realistically, you should integrate this with 3rd party API to make payment first, for the sake of this sample you just have to send the amount you want to top up)_
- Request body: additionalCashBalance (number, non-negative)
- Return 201 if topup success, increase the appropriate cashBalance of the user
- Return 400 if body does not satisfy dto constraint (e.g., non-numeric, or negative value)
- Return 401 if not logged in

Sample Input:

    {
        "additionalCashBalance": 15.67
    }

Sample Output:

    {
        "id": 4559,
        "cashBalance": "27.97",
        "name": "sample user",
        "email": null
    }

### `[GET] /restaurant/`

- Get all restaurants without its menu list, with filter & sort & pagination feature
- Query parameters:
  - datetime (format DD/MM/YYYY/HH:MM): filter restaurant that are open at that datetime
  - itemsperpage (positive integer): returns 'itemsperpage' restaurants (pagination), by default 10, returning all restaurant at once is too heavy
  - page (positive integer): display page number 'page', by default 1
  - pricelte (non-negative number): 'price less than or equal to' filter, default 999999 (arbirary large num)
  - pricegte (non-negative number): 'price greater than or equal to' filter, default 0
  - dishlte (positive integer): 'dish count less than or equal to' filter, default 10000 (arbirary large)
  - dishgte (positive integer): 'dish count grater than or equal to' filter, default 1
  - sort (string): sort alphabetically if 'true', otherwise false, default is also false
- Return 200 if success, with pagination info (total pages, whether next/prev page exist, see sample output below for example)
- Return 400 if any optional query params format is invalid

Sample Input 1:

    itemsperpage=3
    page=21
    sort=true

This means:

- paginate 3 restaurants only per page (per request) \*_(remarks: realistically you'd want more than 3, for example request 50 restaurants at a time and combine with infinite scrolling feature or pagination, for the sake of this example let's just pick a small number so that the sample output is not too big)_
- go to page 21 out of 735 (total page number given below on the output)
- sort alphabetically

Sample Output 1:

    {
        "items": [
            {
                "id": 31206,
                "cashBalance": "4169.97",
                "openingHours": "11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00",
                "restaurantName": "Alhamra"
            },
            {
                "id": 31189,
                "cashBalance": "2367.27",
                "openingHours": "06:00/09:45/14:30/19:45/09:45/03:45/08:00/18:00/17:00/02:00/06:30/17:15/14:45/22:30",
                "restaurantName": "Alinea"
            },
            {
                "id": 31195,
                "cashBalance": "4200.22",
                "openingHours": "11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00/11:00/23:00",
                "restaurantName": "Alioto's Restaurant"
            }
        ],
        "pagination": {
            "totalPages": 735,
            "totalItems": 2204,
            "hasNext": true,
            "hasPrev": true
        }
    }

Sample Input 2:

    itemsperpage=2
    dishgte=14

This means:

- filter restaurants that has more than or equal to 14 dishes in it
- paginate 2 restaurants, by default go to page 1

Sample Output 2:

    {
        "items": [
            {
                "id": 31132,
                "cashBalance": "4483.84",
                "openingHours": "14:30/20:00/11:00/14:00/13:15/03:15/10:00/03:15/14:30/20:00/05:00/11:30/10:45/17:00",
                "restaurantName": "'Ulu Ocean Grill and Sushi Lounge"
            },
            {
                "id": 31144,
                "cashBalance": "960.2",
                "openingHours": "17:00/22:30/17:00/18:45/15:15/03:45/15:15/03:45/09:15/10:45/17:00/18:45/10:45/15:45",
                "restaurantName": "13 Coins"
            }
        ],
        "pagination": {
            "totalPages": 82,
            "totalItems": 164,
            "hasNext": true,
            "hasPrev": false
        }
    }

Sample Input 3:

    itemsperpage=3
    page=9
    dishgte=10
    dishlte=12
    pricegte=11.5
    pricelte=19.99

This means:

- filter restaurants that has between 10 to 12 dishes inclusive within the price range 11.5 to 19.99 inclusive
- paginate 2 restaurants per page, go to page 9 \*(which happens to be the last page here, that's why you see less than 2 restaurant for the output)

Sample Output 3:

    {
        "items": [
            {
                "id": 33081,
                "cashBalance": "1747.03",
                "openingHours": "14:00/01:15/14:00/01:15/14:00/01:15/16:30/03:45/14:00/01:15/09:30/11:00/09:30/11:00",
                "restaurantName": "The Patio on Guerra"
            }
        ],
        "pagination": {
            "totalPages": 9,
            "totalItems": 19,
            "hasNext": false,
            "hasPrev": true
        }
    }

### `[GET] /restaurant/search/`

- Requires 'q' query parameter for search query, optional pagination feature similar to above.
- Get restaurants in descending order or relevance (by Jaro Winkler algorithm)
- It will calculate the jaro distance between `q` and `restaurantName`, and between `q` with all `dishName` (menus associated with the restaurant) minus by 0.1 (so that restaurantName has stronger importance than the dishName), then the relevance is the max out of all
  - \*_(Remarks: realistically, it'd be better to use ElasticSearch or similar service, this algo is quite okay and easy to implement, the main downside is that it cannot detect synonyms)_.
  - For example, if there is a restaurant called `Pasta Express` with `Pizza` and `Beef Spaghetti` as a menu, when the user enter `pizas` for q, it will calculate:
    - Jaro('Pasta Express', 'pizas') = 0.65
    - Jaro('Cheese Pizza', 'pizas') - 0.1 = 0.81
    - Jaro('Beef Spaghetti', 'pizas') - 0.1 = 0.34
    - The max of all of that is 0.81, which will be the relevance
    - Note that we ignore the case here (all letters will be lower cased first)
    - Looking at this example, if you'd search something like `Italian` (referring to italian food), the relevance would be quite low (same with other synonyms or relevant words that is completely different with the restaurant or menu name)
    - Realistically, using services like Elastic Search would make a lot more sense as it can solve the weakness mentioned above
- Return 200 if success, with relevance for each restaurant & pagination info.
  Return 400 if any optional query params format is invalid.

Sample Input:

    q=downtowngrill
    itemsperpage=3

Sample Output:

    {
        "items": [
            {
                "id": 31684,
                "cashBalance": "4513.28",
                "openingHours": "13:30/15:30/13:15/14:45/13:30/15:30/16:00/21:00/13:30/03:15/16:00/21:00/13:15/14:45",
                "restaurantName": "Downing Street Grill",
                "ownerId": 9636,
                "menus": [
                    {
                        "id": 190014,
                        "dishName": "Le Rognon Moutarde",
                        "price": "13.67",
                        "restaurantId": 31684
                    },
                    {
                        "id": 190007,
                        "dishName": "Caracoles en Tazitas a la Borgona",
                        "price": "12.75",
                        "restaurantId": 31684
                    },
                    {
                        "id": 190010,
                        "dishName": "The Mexican Hayride Cocktail",
                        "price": "10.55",
                        "restaurantId": 31684
                    },
                    {
                        "id": 190008,
                        "dishName": "Rex",
                        "price": "10.95",
                        "restaurantId": 31684
                    }
                ],
                "relevance": 0.7064102564102565
            },
            {
                "id": 33248,
                "cashBalance": "225.83",
                "openingHours": "09:15/21:45/15:00/22:45/14:45/23:30/09:15/21:45/14:45/23:30/08:00/21:15/10:15/20:00",
                "restaurantName": "Vintner Grill",
                "ownerId": 9636,
                "menus": [
                    {
                        "id": 203309,
                        "dishName": "Cromesquis of Chicken",
                        "price": "13.16",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203301,
                        "dishName": "Le crabe belle aurore",
                        "price": "10.3",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203306,
                        "dishName": "Rhine wine",
                        "price": "10.75",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203305,
                        "dishName": "Geroosterde Kalfslever met geroosterde Bacon",
                        "price": "13.78",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203310,
                        "dishName": "Imperial Pudding",
                        "price": "12.57",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203302,
                        "dishName": "Broiled Swordfish Steak",
                        "price": "13.59",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203307,
                        "dishName": "Geraucherter Rhein Salm",
                        "price": "12.21",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203304,
                        "dishName": "Suprême de Bass",
                        "price": "11.84",
                        "restaurantId": 33248
                    },
                    {
                        "id": 203308,
                        "dishName": "Huîtres de Lynnhaven",
                        "price": "12.82",
                        "restaurantId": 33248
                    }
                ],
                "relevance": 0.6923076923076922
            }
        ],
        "pagination": {
            "totalPages": 1102,
            "totalItems": 3304,
            "hasNext": true,
            "hasPrev": false
        }
    }

### `[POST] /restaurant/`

- Create a new restaurant instance, cashBalance defaulted to 0, the user who makes the request becomes the restaurant owner (user).
- Return 201 if success, with the new created instance.
- Return 401 if not logged in.
- Return 400 if it does not satisfy dto constraint.
- Return 409 if conflict (same restaurantName).

Sample Input:

    {
        "openingHours":
            "10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45",
        "restaurantName": "newResto"
    }

Sample Output:

    {
        "id": 33335,
        "cashBalance": "0",
        "openingHours": "10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45",
        "restaurantName": "newResto",
        "ownerId": 10637
    }

### `[GET] /restaurant/me/`

- Get all restaurants created by the requesting user.
- Return 200 if success, including all restaurant info except for menus.
- Return 401 if not logged in.

Sample Output:

    [
        {
            "id": 33335,
            "cashBalance": "0",
            "openingHours": "10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45",
            "restaurantName": "newResto",
            "ownerId": 10637
        }
    ]

### `[GET] /restaurant/:id/`

- Get a restaurant instance (including all menu), given its id.
- Return 200 if success, with the restaurant instance and all menu in that restaurant.
- Return 404 if instance not found (invalid id).

Sample Output:

    {
        "id": 32000,
        "cashBalance": "3052.98",
        "openingHours": "11:00/22:00/11:00/22:00/11:00/22:00/11:00/22:00/11:00/22:00/11:00/22:00/12:00/22:00",
        "restaurantName": "John's Grill",
        "ownerId": 9636,
        "menus": [
            {
                "id": 192717,
                "dishName": "Roquefort Cheese",
                "price": "10.3",
                "restaurantId": 32000
            },
            {
                "id": 192713,
                "dishName": "Roast Saddle of Spring Lamb with potatoes Chateau",
                "price": "12.09",
                "restaurantId": 32000
            },
            {
                "id": 192718,
                "dishName": "Granat-Salate",
                "price": "10.53",
                "restaurantId": 32000
            },
            {
                "id": 192716,
                "dishName": "Grouse Roasted",
                "price": "13.11",
                "restaurantId": 32000
            },
            {
                "id": 192709,
                "dishName": "Laubenheimber Rhine Wine",
                "price": "11",
                "restaurantId": 32000
            },
            {
                "id": 192715,
                "dishName": "Gebratene grune Heringe in der Pfanne serviert",
                "price": "10.86",
                "restaurantId": 32000
            },
            {
                "id": 192712,
                "dishName": "Roast chicken w/Dressing",
                "price": "10.5",
                "restaurantId": 32000
            },
            {
                "id": 192714,
                "dishName": "Sea Bass",
                "price": "13.5",
                "restaurantId": 32000
            }
        ]
    }

### `[POST] /restaurant/:id/`

- Create a menu with a foreign key to a restaurant instance.
- Return 201 if success, with the new created instance.
- Return 401 if not logged in.
- Return 400 if it does not satisfy dto constraint.
- Return 403 if not restaurant owner.
- Return 404 if instance not found (invalid id).
- Return 409 if dish name is duplicated in the same restaurant.

### `[PUT] /restaurant/:id/`

- Update existing restaurant instance, given its id.
- Return 200 if success, with the new updated instance.
- Return 401 if not logged in.
- Return 400 if it does not satisfy dto constraint.
- Return 403 if not restaurant owner.
- Return 404 if instance not found (invalid id).

### `[DELETE] /restaurant/:id/`

- Delete existing restaurant instance, given its id.
- Return 204 if success.
- Return 401 if not logged in.
- Return 404 if instance not found (invalid id).
- Return 403 if not restaurant owner.

### `[PUT] /menu/:id/`

- Update existing menu instance, given its id.
- Return 200 if success, with the new updated instance.
- Return 401 if not logged in.
- Return 400 if it does not satisfy dto constraint.
- Return 404 if instance not found (invalid id).
- Return 403 if not restaurant owner of current dish.
- Return 409 if dish name already exist in the same restaurant.

### `[DELETE] /menu/:id/`

- Delete existing menu instance, given its id.
- Return 204 if success, with the new created instance.
- Return 401 if not logged in.
- Return 404 if instance not found (invalid id).
- Return 403 if not restaurant owner of current dish.

### `[POST] /purchase/`

- Create multiple purchases at once, requires a list of (menuId-quantity) object.
- Add appropriate cash balance to restaurant, decrease from user.
- Return 201 if success, with the purchase instances created.
- Return 401 if not logged in.
- Return 400 if it does not satisfy dto constraint, or if store currently closed.
  - \*_Remarks: currently I do not check if store is currently closed or not (implemented that by I comment that part); some reason why I don't include that currently are:_
    - It is annoying that during testing, some restaurants are actually closed and you cannot make the purchase
    - Currently the time still uses GMT+0, so it might cause testing issue and frustration to the tester
    - Some dirty data found (from the json sample data given), including some that says something like 'Monday, open at 21:00 and close at 03:00': technically 3am is already the next day; data like that shouldn't be allowed in the first place but is in the sample data, so then I decided to not check whether store is open or not when making purchases
    - It is hard to incorporate this feature to test case (well you can mock the current time to use a specific time instead of just current time that makes the test result differs everytime, but generally it is more difficult to do so)
- Return 404 if any of the menuId is invalid.
- Return 402 if cash balance insufficient.

Sample Input:

    {
        "items": [
            {
                "menuId": 185342,
                "quantity": 2
            }
        ]
    }

Sample Output:

    [
        {
            "id": 77195,
            "transactionDate": "2023-04-10T05:59:30.127Z",
            "menuId": 185342,
            "userId": 10639
        },
        {
            "id": 77196,
            "transactionDate": "2023-04-10T05:59:30.191Z",
            "menuId": 185342,
            "userId": 10639
        }
    ]

### `[GET] /purchase/me/`

- Get all purchases (see return format below) made by current requesting user.
- Return 401 if not logged in.
- Return 200 if success.

Sample Output:

    [
        {
            "id": 137,
            "transactionDate": "2018-09-19T11:41:00.000Z",
            "menuId": 24527,
            "userId": 354,
            "menuName": "Roastbeef",
            "menuPrice": "10.99"
        },
        {
            "id": 138,
            "transactionDate": "2019-02-18T20:20:00.000Z",
            "menuId": 13987,
            "userId": 354,
            "menuName": "CHARCOAL BROILED CHOPPED SIRLOIN STEAK",
            "menuPrice": "10.27"
        }
    ]

### `[GET] /purchase/restaurant/:id/`

- Get all purchases made for all menus in a particular restaurant id, only available if requesting user is the restaurant owner.
- Return 401 if not logged in.
- Return 404 if restaurant id invalid.
- Return 403 if restaurant not owned by requesting user.
- Return 200 if success, with all purchases in a list, with similar format to the endpoint above.

### `[POST] /sample/populate/`

Populate database with given sample data.
It is an async function, it will run for a few seconds after you get the response. Please call this function only once (in production environment, I have done this so please do not do it again!).

### `[DELETE] /sample/reset/`

Delete all data in the database.
Note that it does not reset the id count back to 1 again. It is an async function, it will run for a few seconds after you get the response.

## Testing

Currently there are a total 127 test cases, including individidual function unit testing and end to end testing, covering all the endpoints and handling many corner cases to ensure errors are handled gracefully and with an appropriate status code.

### Testing Result

Here are the screenshot of all the testing results, you can see which function or endpoint I tested, including the coverage (what are the cases) that I tested.

1. Unit testing of some utility functions that are quite complicated (15 cases)

![Test0](/assets/test0.png)

2. End to End Testing of auth related functionality (see details on image below) (34 cases)

![Test1](/assets/test1.png)

3. End to End Testing of main generic API (see details on image below) (40 cases)

![Test2](/assets/test2.png)

4. End to End Testing of main customized API (see details on image below) (38 cases)

![Test3](/assets/test3.png)

Please refer to `src/tests/` if you want to see in more details about the exact sample data or case, and how I tested a particular functionality.

### Testing Remarks

Some points I'd like to mention regarding my testing method:

- Current test actually does it using database that you're connected to, you can change your database connection at `src/model/model.service.ts`
  - This means that when running test cases, it will reset your actual database connected
  - You might want to perform testing on a sample database (not production database)
- I implemented CI/CD using GitHub action (have to pass all cases before merging to main branch), but currently only functions to test case that does not require database connection
- Usually, some other alternatives of testing that does not involve tweaking database are:
  - Use mock database, there should be libraries/modules that can do this
  - Use a container on Docker, when testing automate creation of sample database

### How to Perform Testing

You can run all test cases by doing `yarn test` or run specific test file (test suite) by doing `yarn src/tests/<test_file_name>`. You might have to `Ctrl+C` first and run `yarn test` again if you make any changes. Again, since I am not mocking the database, please be wary when running the test. Running the test will reset your entire database (so maybe use a local database setup in docker and do not use the live one).

## How To Setup Development Environment

1. Clone the repository, make sure you have node (v18.x is recommended) installed, and prefarably yarn as package manager

2. Install all dependencies with `yarn install`

3. Run database using docker with the command `docker compose up db` (by default setup at port 5432), please change the database connection on `src/model/model.service.ts` to use the ones in Docker and not the production database

4. Install prisma cli, then you can type `npx prisma migrate dev` to makemigrations and migrate changes to the database

5. Type `yarn start` to start main server, by default hosted in port 3000, or you can run `yarn start:dev` to watch for changes and automatically restart the server if there are any changes

6. Using postman or other similar tools, you can create a POST request to the endpoint: `/sample/populate/`, which will automatically populate your database. Please do this only ONCE, it should take up to a minute (the process is asynchronous, even if you have received the response, the database population should take a moment)

7. You can run `npx prisma studio` to host an admin page with UI to view and navigate through the database, by default hosted in port 5555

8. Type `yarn test` to run all test cases, or you can try manually requesting the APIs

Let me know if there are any issues while doing all of these.

If you reach down here, thanks for taking your time to go through all of this. I hope that my implementations and explanations meet your standard!
