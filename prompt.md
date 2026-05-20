You are building a new page for meetjin.com called /explore.

## Context
meetjin.com is the registry for the Agent Intent Protocol (AIP).
The existing stack is React + TypeScript + Supabase + Vite + Tailwind.
Match the existing design system exactly — dark theme, same nav, same footer.

## What to build
A REST API playground page at /explore that lets developers 
test live APIs using their AIP intent maps directly in the browser.

## Page structure

### Header section
Title: "Explore Live APIs"
Subtitle: "Test any intent map live in your browser. 
           Real APIs. Real responses. No setup."

### Category filter bar
Horizontal scrollable pill filters:
All | Weather | Space | Developer | Data | Fun | Finance | Food | Geo

### API cards grid
Responsive grid (3 cols desktop, 2 tablet, 1 mobile)
Each card shows:
- API name + logo/emoji
- Category badge
- Number of intents
- Auth required: Yes / No badge
- Live status indicator (green dot)
- "Test live →" button

### Intent test panel (right side drawer or modal)
Opens when user clicks a card.
Shows:
- API name + description
- List of intents as tabs (if multiple)
- Selected intent shows:
  - Description
  - Dynamic parameter form (auto-generated from 
    intent's parameters object)
  - "Execute" button
  - Response panel — raw JSON in a code block
    with copy button
  - Toggle: "View jin.json" shows the raw intent map
  - "Publish your own →" button links to /docs/quickstart

## The 20 community APIs to pre-load

Hardcode these as the initial dataset in a file called
src/data/community-apis.ts

Each entry follows this shape:
{
  slug: string,
  name: string,
  description: string,
  category: string,
  emoji: string,
  requiresAuth: boolean,
  intentMapUrl: string,  // /.well-known/jin.json URL
  intents: AIPIntent[]   // inline from jin.json
}

Pre-load these 20 APIs:

1. Open-Meteo
   slug: open-meteo
   category: weather
   emoji: 🌤️
   requiresAuth: false
   baseUrl: https://api.open-meteo.com
   intent: get_current_weather
   endpoint: /v1/forecast
   method: GET
   parameters:
     latitude: { type: number, required: true, example: 18.5204 }
     longitude: { type: number, required: true, example: 73.8567 }
     current_weather: { type: boolean, default: true }
     timezone: { type: string, default: "auto" }

2. REST Countries
   slug: rest-countries
   category: geo
   emoji: 🌍
   requiresAuth: false
   baseUrl: https://restcountries.com
   intents:
     get_country_by_name: GET /v3.1/name/{name}
       parameters: name (string, required)
     get_all_countries: GET /v3.1/all
       parameters: fields (string, optional, 
                   example: "name,capital,population")

3. NASA APOD
   slug: nasa-apod
   category: space
   emoji: 🚀
   requiresAuth: false
   baseUrl: https://api.nasa.gov
   intent: get_astronomy_picture
   endpoint: /planetary/apod
   method: GET
   parameters:
     api_key: { type: string, default: "DEMO_KEY" }
     date: { type: string, example: "2026-05-19" }

4. ISS Location
   slug: iss-location
   category: space
   emoji: 🛸
   requiresAuth: false
   baseUrl: http://api.open-notify.org
   intent: get_iss_position
   endpoint: /iss-now.json
   method: GET
   parameters: none

5. JokeAPI
   slug: jokeapi
   category: fun
   emoji: 😄
   requiresAuth: false
   baseUrl: https://v2.jokeapi.dev
   intent: get_joke
   endpoint: /joke/{category}
   method: GET
   parameters:
     category: { type: enum, 
                 values: [Any, Programming, Misc, Dark, Pun],
                 default: Programming }
     safe-mode: { type: boolean, default: true }

6. Advice Slip
   slug: advice-slip
   category: fun
   emoji: 💡
   requiresAuth: false
   baseUrl: https://api.adviceslip.com
   intent: get_random_advice
   endpoint: /advice
   method: GET
   parameters: none

7. Dog CEO
   slug: dog-ceo
   category: fun
   emoji: 🐶
   requiresAuth: false
   baseUrl: https://dog.ceo/api
   intents:
     get_random_dog: GET /breeds/image/random
     get_breeds_list: GET /breeds/list/all

8. Cat Facts
   slug: cat-facts
   category: fun
   emoji: 🐱
   requiresAuth: false
   baseUrl: https://catfact.ninja
   intent: get_cat_fact
   endpoint: /fact
   method: GET
   parameters: none

9. Chuck Norris
   slug: chuck-norris
   category: fun
   emoji: 🥋
   requiresAuth: false
   baseUrl: https://api.chucknorris.io
   intents:
     get_random_joke: GET /jokes/random
     get_joke_by_category: GET /jokes/random?category={category}
       parameters:
         category: { type: enum, 
                     values: [dev, science, sport, history],
                     required: true }

10. JSONPlaceholder
    slug: jsonplaceholder
    category: developer
    emoji: 🧪
    requiresAuth: false
    baseUrl: https://jsonplaceholder.typicode.com
    intents:
      get_posts: GET /posts
        parameters: _limit (number, default: 5)
      get_user: GET /users/{id}
        parameters: id (number, required, example: 1)
      create_post: POST /posts
        parameters:
          title: { type: string, required: true }
          body: { type: string, required: true }
          userId: { type: number, required: true }

11. ReqRes
    slug: reqres
    category: developer
    emoji: 👤
    requiresAuth: false
    baseUrl: https://reqres.in
    intents:
      get_users: GET /api/users
        parameters: page (number, default: 1)
      get_single_user: GET /api/users/{id}
        parameters: id (number, required, example: 2)

12. HTTPBin
    slug: httpbin
    category: developer
    emoji: 🔧
    requiresAuth: false
    baseUrl: https://httpbin.org
    intents:
      test_get: GET /get
      test_post: POST /post
        parameters:
          message: { type: string, required: true }
      get_ip: GET /ip
      get_headers: GET /headers

13. Numbers API
    slug: numbers-api
    category: data
    emoji: 🔢
    requiresAuth: false
    baseUrl: http://numbersapi.com
    intent: get_number_fact
    endpoint: /{number}
    method: GET
    parameters:
      number: { type: number, required: true, example: 42 }

14. Open Library
    slug: open-library
    category: data
    emoji: 📚
    requiresAuth: false
    baseUrl: https://openlibrary.org
    intents:
      search_books: GET /search.json
        parameters:
          q: { type: string, required: true, example: "Harry Potter" }
          limit: { type: number, default: 5 }
      get_book: GET /api/books
        parameters:
          bibkeys: { type: string, required: true, 
                     example: "ISBN:0451526538" }
          format: { type: string, default: "json" }

15. Wikipedia
    slug: wikipedia
    category: data
    emoji: 📖
    requiresAuth: false
    baseUrl: https://en.wikipedia.org
    intent: get_article_summary
    endpoint: /api/rest_v1/page/summary/{title}
    method: GET
    parameters:
      title: { type: string, required: true, example: "Pune" }

16. PokeAPI
    slug: pokeapi
    category: fun
    emoji: ⚡
    requiresAuth: false
    baseUrl: https://pokeapi.co/api/v2
    intents:
      get_pokemon: GET /pokemon/{name}
        parameters: name (string, required, example: "pikachu")
      get_pokemon_list: GET /pokemon
        parameters: limit (number, default: 10)

17. TheMealDB
    slug: themealdb
    category: food
    emoji: 🍽️
    requiresAuth: false
    baseUrl: https://www.themealdb.com/api/json/v1/1
    intents:
      get_random_meal: GET /random.php
      search_meal: GET /search.php
        parameters: s (string, required, example: "chicken")

18. CoinDesk Bitcoin Price
    slug: coindesk
    category: finance
    emoji: ₿
    requiresAuth: false
    baseUrl: https://api.coindesk.com
    intent: get_bitcoin_price
    endpoint: /v1/bpi/currentprice.json
    method: GET
    parameters: none

19. IP-API
    slug: ip-api
    category: geo
    emoji: 📍
    requiresAuth: false
    baseUrl: http://ip-api.com
    intent: get_ip_location
    endpoint: /json/{ip}
    method: GET
    parameters:
      ip: { type: string, required: false, 
            example: "8.8.8.8",
            description: "Leave empty for your own IP" }

20. Lorem Picsum
    slug: lorem-picsum
    category: developer
    emoji: 🖼️
    requiresAuth: false
    baseUrl: https://picsum.photos
    intents:
      get_random_image_url: GET /200/300
        parameters:
          width: { type: number, default: 200 }
          height: { type: number, default: 300 }
      get_image_list: GET /v2/list
        parameters: limit (number, default: 5)

## Execute button behaviour

When user hits Execute:
1. Build the URL from baseUrl + endpoint + parameters
2. fetch() directly from browser
3. Handle CORS — if blocked, show:
   "This API blocks browser requests. 
    Copy the curl command below to test in terminal."
   Then show: curl -X GET "full_url"
4. Show response in syntax-highlighted JSON block
5. Show: status code, response time in ms

## Important UX notes

- Parameter form is auto-generated from the 
  parameters object — input type matches 
  parameter type (number input for number, 
  select for enum, text for string)
- Default values pre-filled in the form
- Required fields marked with *
- On mobile: drawer slides up from bottom
- Loading state on Execute button while fetching
- Error state if API is down — 
  show "API may be temporarily unavailable"
- Each card has a live status indicator —
  ping the API on page load, green if 200 ok

## File structure

apps/web/src/pages/Explore.tsx       — main page
apps/web/src/data/community-apis.ts  — the 20 APIs
apps/web/src/components/ApiCard.tsx  — card component
apps/web/src/components/IntentPanel.tsx — test panel
apps/web/src/components/ParamForm.tsx   — dynamic form

Add route /explore to the router.
Add "Explore" to the main nav between "Registry" and "Build".

## Definition of done

1. /explore renders all 20 API cards
2. Clicking a card opens the test panel
3. Filling parameters and hitting Execute 
   returns a real API response
4. At least Open-Meteo, JSONPlaceholder, 
   and PokeAPI work end to end in browser
5. jin.json toggle shows the raw intent map
6. Mobile responsive
7. Matches existing meetjin.com design system