# Guess the weather game :sunny: :snowflake:
![image](https://user-images.githubusercontent.com/45566396/80802040-6dbe9b80-8bae-11ea-9c21-54f44d81342c.png)
![image](https://user-images.githubusercontent.com/45566396/80802099-a0689400-8bae-11ea-99f0-cc0bf14bbdd6.png)

#### [Click here to open the live link](https://frozen-refuge-52748.herokuapp.com/)

## Description :space_invader:
This is a real time web app where users can play a game where they have to guess the current weather at given locations. Each round a random user will be able to pick a question type (open or multiple choice) and a location. The first person to guess the answer gets the most points (100) the next one to guess the answer gets 90 and so on. When the game is over the scoreboard will be shown and after a given time of 15 seconds every user will be redirected to the homepage to reset the game.

## Features :sparkles:
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

#### Things I wanted to add if I had more time :alarm_clock:
* Save all scores in a database
* Show the correct answer when the round is over
* Picking a new question picker when the current question picker leaves the game
* A custom "prompt" to ask for a username

## Data life cycle :arrows_counterclockwise:
![image](https://user-images.githubusercontent.com/45566396/80964848-d9547300-8e11-11ea-9b88-234bbf601e67.png)

When a user joins the room, the user data will be saved on the server. When the question picker starts the round, the game data will be created and updated on the server. After this data will be fetched from the Openweather API to get the correct answer for that round. When the guessers are guessing, their answers will be checked with the correct answer, if it's wrong, do nothing, if it's right, update the points for that user. When the round is over the game data will be updates towards the client and the next round will be started.

#### Data on the server (non persistent data) 
This is my single source of truth.

I keep track of all data on the server, this is game data and user data. You can exactly see what data is stored on the server in my Data Life Cycle. The answers users give will also be checked on the server. This will be sent to the client when needed.

#### Database (persistent data)

> I didn't have time to connect a database to my application. But if I had a database connected, I would put all game scores from all games to keep that data persistent. This data isn't likely to get modified. Another reason to save data on the database is that if I would save the data on the server, it will get wiped when the server isn't active anymore. I would add a button on the homepage that shows a list of all previous games that happened. You would be able to see the user names and the scores they had.

## Socket server events 

> :bulb:  Click an event for more information 

### General
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">connection</summary>
      This is a default event by socket.io that fires when a user opens the web page. In this event I keep track of the current user and all the users in game. In this event all my other events (see below) will be stated.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">new-user</summary>
      This event fires when the user fills in a user name, or hits cancel on the prompt. In this event a new user object is created that pushes the new user into an array with all users. Also the user's role will be assigned (question-picker or guesser). When a user joins the scoreboard (list of online users and their points) will also be updated. When a user joins mid game, the game data will be updated for that user so that the user can also participate in the current game.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">disconnect</summary>
      This is a default event by socket.io that fires when a user leaves the web page. In this event I remove users from the scoreboard (user list) and gamedata will be updated accordingly. Also if everyone left the webpage the game will be reset.
</details>

### Chat messages
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">send-chat-message</summary>
      This event fires when a user sends something in the chat. First it checks multiple conditions to check if the user is even allowed to send a message. When the user is allowed to send a message, the message will be checked if it corresponds to the current answer in that round. If it's wrong, a normal messages will be shown with the user's answer.
</details>

### Commands
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">send-command</summary>
      This event fires when someone tried to type a command. When the user is the question-picker, then the user can type the command to fetch the correst answer from the API and start the round. When the round is started the gamedata will be updated accordingly. If the user tries to execute a command that doesn't exist, give feedback to the user.
</details>

### Game elements
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">multipleChoice-guessed</summary>
      This event fires when a user guesses an answer if it's a multiple choice question. The user's data will be updated when this event fires. When the user tries to guess again it will fail because it will first check if the user hasn't guessed an answer yet in the current round.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">end-round</summary>
      This event fires when the timer has reached 0. First it updates some game data, then it checks if it's game over. If yes, reset the game, if not, update user roles (question-picker and guesser) and update user data and game data. 
</details>

## Socket client listeners
### Connections
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">user-connected</summary>
      This will tell all users that a new user joined the game.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">user-disconnected</summary>
     This will tell all users that a user left the game.
</details>

### Chat messages
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">your-chat-message</summary>
      This will show your guesses in chat.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">their-chat-message</summary>
      This will show the guesses from the other users in chat.
</details>

### Commands
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">command-executed</summary>
      In this listener I append messages bases on what command it is.
</details>

### Game elements
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">scoreboard</summary>
      In this listener I fire a function which updates the scoreboard. It first deletes all elements, then if appends containers with the user names and the scores. 
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">start-round</summary>
      In this listener I first clear the entire container. Then it checks if the question is multiple choice or not. If it's multiple choice, it creates buttons with fake answers and the correct answer of course. Finally it starts the timer for that round.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">next-round</summary>
      In this listener I also clear the container, and append a container which says "Next round" with a timeout. It also removes the old timer from the previous round.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">question-see-answer</summary>
      This listener shows the correct answer to the question-picker only.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">new-question-picker</summary>
      This listener tells everyone who's a guesser the new question-picker for the new round. This also changes the input and button value to make it say "Type your guess..." and "Guess!".
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">question-help</summary>
      This explains the question-picker how to pick a question. This also changes the input and button value to make it say "Type your question" and "Send".
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">user-guessed</summary>
      This tells everyone when a user guessed the answer.
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">game-over</summary>
      This listener clears the container, and appends a scoreboard with all the scores from each user. Also a timer will be started (15 seconds) to make sure everyone leaves the game and the game can be reset.
</details>

### Errors
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">error-handling</summary>
      In this listener I give feedback to the user based on what error is happening. For example: "Wait for the next round", "This location does not exist" or "You already guessed this round" if it's a multiple choice question. These are the following error-messages:
      <ul>
        <li>round-not-started</li>
        <li>round-in-progress</li>
        <li>wait-for-next-round</li>
        <li>already-guessed</li>
        <li>wrong-location</li>
      </ul>
</details>
<details>
    <summary style="background-color: #f0f0f0; cursor: pointer; width: fit-content; padding: .5em; margin: 10px">command-not-existing</summary>
      This listener will tell the user the command he/she's trying to execute does not exist. It also shows all available commands.
</details>

## API :cloud:
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

## Installation :computer:

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

## Sources :link:
* [MDN](https://developer.mozilla.org/nl/) - Main source for javascript code
* [Socket.io](https://socket.io/) - For documentation about socket.io
* [This socket.io tutorial](https://www.youtube.com/watch?v=rxzOqP9YwmM&t=926s) - It helped me setup the basics of my project

## Check it out! :tada:
##### [Click here to open the live link](https://frozen-refuge-52748.herokuapp.com/)

## Unique word chat app :rainbow:
##### [Click here to check out my unique chat app from week 1](https://github.com/StefanGerrits2/real-time-web-1920/wiki/Unique-word-chat-app)

## License :pushpin:
MIT © Stefan Gerrits