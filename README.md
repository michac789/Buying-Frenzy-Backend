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

- Login functionality using jwt \*_(for this simplistic example, it only return access token, not with refresh token)_
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
  - dishlte (positive integer): 'dish count less than or equal to' filter, default 1000 (arbirary large)
  - dishgte (positive integer): 'dish count grater than or equal to' filter, default 1
  - sort (boolean): sort alphabetically if true, default false

Return 200 if success, with pagination info (total pages, whether next/prev page exist)
Return 400 if any optional query params format is invalid.

Sample Output:

    {
        "items": [
            {
                "id": 20034,
                "cashBalance": "4483.84",
                "openingHours": "Mon, Fri 2:30 pm - 8 pm / Tues 11 am - 2 pm / Weds 1:15 pm - 3:15 am / Thurs 10 am - 3:15 am / Sat 5 am - 11:30 am / Sun 10:45 am - 5 pm",
                "restaurantName": "'Ulu Ocean Grill and Sushi Lounge"
            },
            {
                "id": 20035,
                "cashBalance": "2614.96",
                "openingHours": "Mon, Weds 5:15 am - 8:30 pm / Tues, Sat 1:30 pm - 3:45 pm / Thurs 7:45 am - 8:15 am / Fri 1:30 pm - 7 pm / Sun 12:45 pm - 6:15 pm",
                "restaurantName": "12 Baltimore"
            },
            {
                "id": 20036,
                "cashBalance": "4841.8",
                "openingHours": "Mon - Weds 11 am - 9 pm / Thurs 6 am - 9 pm / Fri 12:15 pm - 7 pm / Sat 2:45 pm - 1:30 am / Sun 7 am - 4:15 pm",
                "restaurantName": "1515 Restaurant"
            },
            {
                "id": 20037,
                "cashBalance": "960.2",
                "openingHours": "Mon 5 pm - 10:30 pm / Tues, Sat 5 pm - 6:45 pm / Weds - Thurs 3:15 pm - 3:45 am / Fri 9:15 am - 10:45 am / Sun 10:45 am - 3:45 pm",
                "restaurantName": "13 Coins"
            },
            {
                "id": 20038,
                "cashBalance": "4260.93",
                "openingHours": "Mon 4:30 pm - 11:15 pm / Tues, Sat 3:30 pm - 5 pm / Weds 5:15 am - 9:30 pm / Thurs 1 pm - 2:15 pm / Fri 6:45 am - 7:45 am / Sun 8:30 am - 2 am",
                "restaurantName": "17 at The Sam Houston Hotel-Houston"
            },
            {
                "id": 20039,
                "cashBalance": "4632.74",
                "openingHours": "Mon, Weds 11 am - 8 pm / Tues, Thurs - Fri 1:15 pm - 8:30 pm / Sat 7:45 am - 6:15 pm / Sun 11:45 am - 6 pm",
                "restaurantName": "2 Cents"
            },
            {
                "id": 20042,
                "cashBalance": "3211.97",
                "openingHours": "Mon 6 am - 8:30 pm / Tues - Weds 6:45 am - 3 pm / Thurs 6:15 am - 8:30 am / Fri 4 pm - 10:15 pm / Sat 1:30 pm - 11:45 pm / Sun 6:30 am - 8:15 am",
                "restaurantName": "15Fifty - Sheraton - Starwood"
            },
            {
                "id": 20045,
                "cashBalance": "416.69",
                "openingHours": "Mon 10:30 am - 3:15 pm / Tues - Weds 7:15 am - 12:30 am / Thurs 6:45 am - 12 am / Fri 5 am - 11:30 pm / Sat - Sun 5:30 am - 9:45 am",
                "restaurantName": "1808 American Bistro"
            },
            {
                "id": 20041,
                "cashBalance": "1320.19",
                "openingHours": "Mon, Weds 3:45 pm - 5 pm / Tues 11:30 am - 3 am / Thurs 10 am - 11:30 pm / Fri 7 am - 9:45 am / Sat 12:45 pm - 1:15 pm / Sun 2 pm - 7 pm",
                "restaurantName": "100% Mexicano Restaurant"
            },
            {
                "id": 20043,
                "cashBalance": "4629.91",
                "openingHours": "Mon 5:30 am - 6 pm / Tues 10 am - 12:15 am / Weds 1:45 pm - 4:45 pm / Thurs 7:15 am - 3:45 am / Fri 1:30 pm - 12:45 am / Sat 7 am - 11:45 am / Sun 1:15 pm - 12:30 am",
                "restaurantName": "100% de Agave"
            }
        ],
        "pagination": {
            "total": 221,
            "hasNext": true,
            "hasPrev": false
        }
    }

### `[GET] /restaurant/search/`

Requires 'q' query parameter for search query, optional pagination similar to above.
Get restaurants in descending order or relevance (by Jaro Winkler algo).
Return 200 if success, with relevance for each restaurant & pagination info.
Return 400 if any optional query params format is invalid.

Sample Output:

    {
        "items": [
            {
                "id": 20034,
                "cashBalance": "4483.84",
                "openingHours": "Mon, Fri 2:30 pm - 8 pm / Tues 11 am - 2 pm / Weds 1:15 pm - 3:15 am / Thurs 10 am - 3:15 am / Sat 5 am - 11:30 am / Sun 10:45 am - 5 pm",
                "restaurantName": "'Ulu Ocean Grill and Sushi Lounge",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 91616,
                        "dishName": "DRY LIGHT IMPORTED WINE",
                        "price": "13.5",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91620,
                        "dishName": "Broiled Pompano",
                        "price": "13.5",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91621,
                        "dishName": "Dean Yale School of Medicine",
                        "price": "12.56",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91622,
                        "dishName": "Place here Stamp",
                        "price": "12.38",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91623,
                        "dishName": "1908 Berncasteler",
                        "price": "11.64",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91624,
                        "dishName": "Hummersuppe Filetsteak Nelson",
                        "price": "10.51",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91625,
                        "dishName": "Hominy",
                        "price": "10.2",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91626,
                        "dishName": "Baltimore terrapin",
                        "price": "14",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91627,
                        "dishName": "Lettuce and Tomato Salads",
                        "price": "11.79",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91619,
                        "dishName": "Coffee Cocktail (Port Wine",
                        "price": "12.45",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91615,
                        "dishName": "La Romaine Braisée au Fond de Veau",
                        "price": "10.59",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91618,
                        "dishName": "GAI TOM KA: CHICKEN IN COCONUT CREAM SOUP WITH LIME JUICE GALANGA AND CHILI",
                        "price": "10.64",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91617,
                        "dishName": "Postum cereal coffee",
                        "price": "13.88",
                        "restaurantId": 20034
                    },
                    {
                        "id": 91628,
                        "dishName": "Sweet Virginia Pickles",
                        "price": "10.15",
                        "restaurantId": 20034
                    }
                ],
                "relevance": 0.9
            },
            {
                "id": 20879,
                "cashBalance": "3095.29",
                "openingHours": "Mon, Thurs - Fri 11 am - 6:30 pm / Tues - Weds 8 am - 12:30 am / Sat 8 am - 3:45 am / Sun 1:45 pm - 3:15 am",
                "restaurantName": "J&R Tacos",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 98808,
                        "dishName": "DRY TOAST",
                        "price": "12.73",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98813,
                        "dishName": "Sauterne",
                        "price": "11.25",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98807,
                        "dishName": "œufs Plat Miroir",
                        "price": "11.12",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98812,
                        "dishName": "Cold York Ham",
                        "price": "10.39",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98817,
                        "dishName": "Physical Culture Health Bread",
                        "price": "10.42",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98809,
                        "dishName": "Tomato",
                        "price": "12.82",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98814,
                        "dishName": "Lobster a l'Americaine",
                        "price": "15.7",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98818,
                        "dishName": "Mushroom omelette with bacon",
                        "price": "30",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98805,
                        "dishName": "Hors d'Oeuvres varies",
                        "price": "10.75",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98810,
                        "dishName": "Toast à la moëlle",
                        "price": "13.22",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98815,
                        "dishName": "1865 Scharzhofberger",
                        "price": "12.28",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98806,
                        "dishName": "Steamed Lemon Pudding",
                        "price": "10.4",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98811,
                        "dishName": "Guinea hen (half) currant jelly (20 min.)",
                        "price": "11.25",
                        "restaurantId": 20879
                    },
                    {
                        "id": 98816,
                        "dishName": "B & B (Benedictine & Brandy",
                        "price": "10.6",
                        "restaurantId": 20879
                    }
                ],
                "relevance": 0.7164251207729468
            },
            {
                "id": 21987,
                "cashBalance": "2809",
                "openingHours": "Mon 3:30 pm - 8:15 pm / Tues 9:45 am - 3:45 am / Weds 5:30 pm - 3 am / Thurs 9:15 am - 11:15 am / Fri - Sat 8:15 am - 6:15 pm / Sun 10 am - 11:30 am",
                "restaurantName": "The Patio",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 108230,
                        "dishName": "Ballottine de canard",
                        "price": "10.49",
                        "restaurantId": 21987
                    },
                    {
                        "id": 108227,
                        "dishName": "Fried Chicken a la Maryland [with] Corn Fritters",
                        "price": "12.79",
                        "restaurantId": 21987
                    },
                    {
                        "id": 108229,
                        "dishName": "De Luxe Scotch Brands",
                        "price": "10.9",
                        "restaurantId": 21987
                    },
                    {
                        "id": 108226,
                        "dishName": "DRY GIN  IND. BOTTLE",
                        "price": "10.25",
                        "restaurantId": 21987
                    }
                ],
                "relevance": 0.7045962732919255
            },
            {
                "id": 21701,
                "cashBalance": "3323.86",
                "openingHours": "Mon 7:45 am - 1:30 pm / Tues, Fri 12 pm - 12 am / Weds 1:15 pm - 11:45 pm / Thurs, Sun 11:45 am - 3:15 pm / Sat 9:30 am - 6:45 pm",
                "restaurantName": "Shula's Steak House - Hyatt Regency Houston",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 105753,
                        "dishName": "3 oeufs brouillés ou oeufs sur le plat",
                        "price": "13.56",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105758,
                        "dishName": "DRY POUILLY RESERVE",
                        "price": "10.27",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105754,
                        "dishName": "Pikantes Rehragou",
                        "price": "10.62",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105759,
                        "dishName": "Ackerman Laurance Dry Royal",
                        "price": "14.35",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105752,
                        "dishName": "Chablis (Imported)",
                        "price": "15",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105757,
                        "dishName": "VANILLA ICE CREAM",
                        "price": "10.72",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105762,
                        "dishName": "Calfshead a la Vinaigrette",
                        "price": "12.48",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105756,
                        "dishName": "Insalata di Frutta Esotica",
                        "price": "13.82",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105760,
                        "dishName": "Kippered Herring with Fried Egg",
                        "price": "10.6",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105755,
                        "dishName": "Sausage",
                        "price": "25",
                        "restaurantId": 21701
                    },
                    {
                        "id": 105761,
                        "dishName": "haute sauterne",
                        "price": "12.83",
                        "restaurantId": 21701
                    }
                ],
                "relevance": 0.6889969488939741
            },
            {
                "id": 20313,
                "cashBalance": "4445.19",
                "openingHours": "Sun - Tues 3:45 pm - 2:15 am / Weds 10 am - 3:45 pm / Thurs - Fri 1:30 pm - 1 am / Sat 2:45 pm - 2:30 am",
                "restaurantName": "Buca di Beppo - Southlake",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 94001,
                        "dishName": "GUFFANTI'S SPECIAL CIGARS",
                        "price": "16.25",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94006,
                        "dishName": "RICE PUDD.",
                        "price": "10.15",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94003,
                        "dishName": "DRY MARTINI",
                        "price": "10.39",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94000,
                        "dishName": "Sliced bananas with orange",
                        "price": "10.2",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94005,
                        "dishName": "1993er FLEUR DU ROY",
                        "price": "11.44",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94004,
                        "dishName": "Mainzer Kase mit Roggelchen un Butter",
                        "price": "13.43",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94009,
                        "dishName": "Lake Trout",
                        "price": "10.75",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94002,
                        "dishName": "Puree of squash",
                        "price": "10.5",
                        "restaurantId": 20313
                    },
                    {
                        "id": 94007,
                        "dishName": "Iced Papaya Juice",
                        "price": "11.41",
                        "restaurantId": 20313
                    }
                ],
                "relevance": 0.6863416776460255
            },
            {
                "id": 22042,
                "cashBalance": "3639.43",
                "openingHours": "Mon 7 am - 5:15 pm / Tues, Thurs 3:45 pm - 12:30 am / Weds 1:30 pm - 8:30 pm / Fri - Sat 7:30 am - 3:30 am / Sun 8:30 am - 7 pm",
                "restaurantName": "The White Buffalo Club",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 108717,
                        "dishName": "Alexandra",
                        "price": "10.5",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108719,
                        "dishName": "Amaretto di Sarono",
                        "price": "13.06",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108722,
                        "dishName": "Grilled Baby Chicken Méphisto",
                        "price": "13.72",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108724,
                        "dishName": "IMPORTED ITALIAN CHIANTI WINE",
                        "price": "13.75",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108727,
                        "dishName": "Fischballe",
                        "price": "10.17",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108729,
                        "dishName": "Junge Ente",
                        "price": "12.1",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108718,
                        "dishName": "Pol Roger Brut 1945",
                        "price": "12",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108720,
                        "dishName": "12 Weinbergschnecken im Haus mit Toast",
                        "price": "12.96",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108723,
                        "dishName": "Flusskrebsensuppe mit Cognac",
                        "price": "12.81",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108726,
                        "dishName": "BROILED T-BONE STEAK- So tender and juicy you will smack your lips",
                        "price": "10.73",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108728,
                        "dishName": "BROILED FRESH BABY MACKEREL - Melted Fresh Creamery Butter",
                        "price": "10.45",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108730,
                        "dishName": "Fresh Lettuce and Tomato Salad",
                        "price": "12.62",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108721,
                        "dishName": "Les Filets de Sea Bass Poches Bourguignonne",
                        "price": "12.6",
                        "restaurantId": 22042
                    },
                    {
                        "id": 108725,
                        "dishName": "bent's crackers",
                        "price": "13.74",
                        "restaurantId": 22042
                    }
                ],
                "relevance": 0.5779636497540703
            },
            {
                "id": 21103,
                "cashBalance": "4785.87",
                "openingHours": "Mon - Tues, Fri 6:15 am - 1:45 pm / Weds, Sat 12:30 pm - 10 pm / Thurs 10:15 am - 11:45 pm / Sun 1:30 pm - 1 am",
                "restaurantName": "Ludwig's",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 100616,
                        "dishName": "BROILED PRIME DINNER STEAK",
                        "price": "12.75",
                        "restaurantId": 21103
                    },
                    {
                        "id": 100620,
                        "dishName": "Squab Guinea Hen Venitienne",
                        "price": "12",
                        "restaurantId": 21103
                    },
                    {
                        "id": 100619,
                        "dishName": "Tikwah II (Medoc) Palestine Carmel Wine",
                        "price": "10.75",
                        "restaurantId": 21103
                    }
                ],
                "relevance": 0.5768239811718072
            },
            {
                "id": 21389,
                "cashBalance": "4199.28",
                "openingHours": "Mon - Weds 11 am - 6 pm / Thurs 12:15 pm - 3 pm / Fri - Sat 7:30 am - 10:30 am / Sun 6:45 am - 12 am",
                "restaurantName": "PRISM",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 103155,
                        "dishName": "Beech-Nut Bacon and Eggs",
                        "price": "10.65",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103159,
                        "dishName": "Fresh Mushrooms Stuffed with Oyster Crabs",
                        "price": "12.68",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103157,
                        "dishName": "Virgin Rum Swizzle- 1 oz. Virgin Islands dark rum",
                        "price": "10.6",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103156,
                        "dishName": "Assorted Garden Vegetable Plate with Poached Egg",
                        "price": "10.85",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103161,
                        "dishName": "Chicken Consomme with Tapioca",
                        "price": "11.82",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103160,
                        "dishName": "Dessert Tour Eiffel",
                        "price": "13.12",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103154,
                        "dishName": "Buttered Broad Beans",
                        "price": "12.91",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103158,
                        "dishName": "Home-made corned brisket of beef with cabbage or spinach",
                        "price": "12.65",
                        "restaurantId": 21389
                    },
                    {
                        "id": 103163,
                        "dishName": "Pralinee Ice Cream",
                        "price": "10.3",
                        "restaurantId": 21389
                    }
                ],
                "relevance": 0.5768115942028985
            },
            {
                "id": 20157,
                "cashBalance": "2144.46",
                "openingHours": "Sun - Mon 6 am - 11:30 am / Tues 7:15 am - 3:15 am / Weds 9:15 am - 9:30 pm / Thurs, Sat 1:45 pm - 2:15 am / Fri 9:30 am - 9 pm",
                "restaurantName": "BRASSERIE TEN TEN",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 92647,
                        "dishName": "Poctrine de Veau Farois Porte Maillot",
                        "price": "12.5",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92652,
                        "dishName": "Roast Ribs of Lamb",
                        "price": "10.45",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92648,
                        "dishName": "Fränkische Leberwurst mit Bauernbrot",
                        "price": "12.32",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92650,
                        "dishName": "Smelts sautes",
                        "price": "12.33",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92656,
                        "dishName": "Booths gin",
                        "price": "10.15",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92646,
                        "dishName": "Lake Trout",
                        "price": "10.5",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92653,
                        "dishName": "Asperges",
                        "price": "13.84",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92657,
                        "dishName": "Gold Cap Port Wine",
                        "price": "12.81",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92651,
                        "dishName": "Fresh Mushroom Omelette",
                        "price": "10.45",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92655,
                        "dishName": "Salade Yam - Yam",
                        "price": "12.74",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92649,
                        "dishName": "cold asparagus salad",
                        "price": "10.2",
                        "restaurantId": 20157
                    },
                    {
                        "id": 92654,
                        "dishName": "BEEF WITH PEPPERS Beef slices in a lively sauce with peppers.",
                        "price": "10.89",
                        "restaurantId": 20157
                    }
                ],
                "relevance": 0.5743393009377664
            },
            {
                "id": 21639,
                "cashBalance": "347.94",
                "openingHours": "Mon, Weds 7:30 am - 12:45 am / Tues 12:30 pm - 2:30 pm / Thurs 7:30 am - 6 pm / Fri 8:30 am - 3:30 pm / Sat 11 am - 1:45 pm / Sun 7:30 am - 4 pm",
                "restaurantName": "Sal y Pimienta Kitchen",
                "ownerId": 4560,
                "menus": [
                    {
                        "id": 105258,
                        "dishName": "Nuits",
                        "price": "13",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105263,
                        "dishName": "VOL AU VENT DE RIS DE VEAU",
                        "price": "13.77",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105268,
                        "dishName": "Pumpkin Cake",
                        "price": "10.2",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105260,
                        "dishName": "Femoring med lok och stekt agg",
                        "price": "12.89",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105264,
                        "dishName": "Sorbet Nicois",
                        "price": "11.39",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105259,
                        "dishName": "Frische norwegische Heringshappen in Dillsauce",
                        "price": "13.81",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105265,
                        "dishName": "potage au vermicelle",
                        "price": "11.92",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105269,
                        "dishName": "Brandied peach",
                        "price": "10.4",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105257,
                        "dishName": "Cold Meats - Roast Beef",
                        "price": "12.82",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105262,
                        "dishName": "Half-Sandwich (choice of Tuna Salad",
                        "price": "12",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105270,
                        "dishName": "EARLE GREY TWININGS TEA",
                        "price": "10.75",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105256,
                        "dishName": "Moet & Chandon champagne special vintage 1900",
                        "price": "13.88",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105261,
                        "dishName": "Sirloin with Truffles",
                        "price": "11.01",
                        "restaurantId": 21639
                    },
                    {
                        "id": 105266,
                        "dishName": "All Beef Hamburger",
                        "price": "10.5",
                        "restaurantId": 21639
                    }
                ],
                "relevance": 0.5721014492753623
            }
        ],
        "pagination": {
            "total": 221,
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

### `[GET] /restaurant/:id/`

- Get a restaurant instance (including all menu), given its id.
- Return 200 if success, with the restaurant instance and all menu in that restaurant.
- Return 404 if instance not found (invalid id).

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
- Return 404 if any of the menuId is invalid.
- Return 402 if cash balance insufficient.

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

![Test1](/assets/test1.png)

TODO - put more testing results here
