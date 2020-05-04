# Guess the temperature game
![image](https://user-images.githubusercontent.com/45566396/80802040-6dbe9b80-8bae-11ea-9c21-54f44d81342c.png)
![image](https://user-images.githubusercontent.com/45566396/80802099-a0689400-8bae-11ea-99f0-cc0bf14bbdd6.png)

#### [Click here to open the live link](https://frozen-refuge-52748.herokuapp.com/)

## Description
This is a real time web app where users can play a game where they have to guess the current weather at given locations. Each round a random user will be able to pick a question type (open or multiple choice) and a location. The first person to guess the answer gets the most points (100) the next one to guess the answer gets 90 and so on. When the game is over the scoreboard will be shown and after a given time of 15 seconds every user will be redirected to the homepage to reset the game.

## Features
* Playing the game with multiple people (no limit)
* Scoreboard including users and points
* First user to join will start off as the one who picks the question
* Question picker will be able to see the answer
* Every round there's a new person who's the question picker
* Open, and multiple choice questions
  * Open: you can guess without limits
  * Multiple choice: you can only guess 1 time
* You earn consecutively less points if others guess the answer first
* Getting the temperature from a specific place
* A timer each round
* Game over screen, scores are shown.
* New users can join mid-game.

#### Things I wanted to add if I had more time
* Save all scores in a database
* Show the correct answer when the round is over
* Picking a new question picker when the current question picker leaves the game
* A custom "prompt" to ask for a username

## Data life cycle
![image](https://user-images.githubusercontent.com/45566396/80801862-f426ad80-8bad-11ea-8ae6-314085dbc58a.png)

When a user joins the room, the user data will be saved on the server. When the question picker starts the round, the game data will be created and updated on the server. After this data will be fetched from the Openweather API to get the correct answer for that round. When the guessers are guessing, their answers will be checked with the correct answer, if it's wrong, do nothing, if it's right, update the points for that user. When the round is over the game data will be updates towards the client and the next round will be started.

## Socket server events
* `connection`
* `new-user`
* `send-chat-message`
* `multipleChoice-guessed`
* `send-command`
* `end-round`
* `disconnect`

## Socket client listeners
* `their-chat-message`
* `your-chat-message`
* `user-connected`
* `user-disconnected`
* `global-command-executed`
* `personal-command-executed`
* `command-not-existing`
* `scoreboard`
* `start-round`
* `next-round`
* `question-see-answer`
* `new-question-picker`
* `question-help`
* `user-guessed`
* `game-over`
* `error-handling`

## API
#### Openweather API
![image](https://user-images.githubusercontent.com/45566396/80951157-9be2ec00-8df7-11ea-8d9e-1372e6b5cb3d.png)

Returns the current weather from a given location.
I use the Current weather data.

<details>
    <summary>Click here for some data properties and values</summary>
        <ul>
            <li>"temp": 281.52</li>
            <li>"feels_like": 278.99</li>
            <li>"temp_min": 280.15</li>
            <li>"temp_max": 283.71</li>
            <li>"pressure": 1016</li>
            <li>"humidity": 93</li>
        </ul>
</details>
<br>

* Each IP that makes a call has a rate limit of 1000 calls per day and 60 calls per minute
* Key needed
* HTTPS

#### Root endpoint

`api.openweathermap.org/data/2.5/weather`

* I use `?q=` to specify a location I want the weather of. The `q` can be the following things:
  * By name (city, state or country)
  * By city ID
  * By geographic coordinates
  * By ZIP code

<details>
    <summary >This is how a raw object looks when I fetch it from the API</summary>
    <img src="https://user-images.githubusercontent.com/45566396/80950995-460e4400-8df7-11ea-9883-257d0a97c872.png
">
</details>

## Installation

### 1. Clone this repository to your computer
Run this command in your terminal:

`git clone https://github.com/StefanGerrits2/real-time-web-1920`
### 2. Navigate into the root of the folder
Run this command in your terminal:

`cd real-time-web-1920`

### 3 Installing packages
Run this command in your terminal:

`npm install`

### 4. Viewing the website
Run this command in your terminal:

`npm run start`

Now go to your `localhost:3000` in your browser.

If you want to view in dev mode, run:

`npm run dev`

and (optional)

`npm run watch:css` in another terminal if you want to update the css

## Sources

## Check it out!
##### [Click here to open the live link](https://frozen-refuge-52748.herokuapp.com/)


## Unique word chat app

##### [Click here to check out my unique chat app from week 1](https://github.com/StefanGerrits2/real-time-web-1920/wiki/Unique-word-chat-app)