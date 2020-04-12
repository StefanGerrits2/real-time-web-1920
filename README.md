## Useful app (concept)

My idea is to use the Spotify API to create a game where you need to guess a song the other users can queue. The more songs you guess, the more points you get. 

I was thinking of the following features:
* Getting a hint about the name of the song when you press a button or type in /hint. You will get less points if you guess it with a hint.

* You can play the game with multiple users.

* Queue a song by typing in the song name (only that users sees the song name)

* Everyone will be able to see the guesses you make except the answer if you guessed the song name.

* Points will be updated each round, when the game is over the scoreboared will be shown.

## Unique word chat app

![image](https://user-images.githubusercontent.com/45566396/78790343-b075c500-79ae-11ea-84b6-26a3f093b852.png)
#### [Click here to open the live link](https://frozen-refuge-52748.herokuapp.com/)

### Description

This is a chat app made with sockets. You can connect to it and fill in your name. After this you're able to send messages to everyone else that's connected. 

### Special feature

I've created a feature which forces the users to not copy eachothers texts and thus to use unique words. Every unique word that has been typed will be saved on the server. You can see these words if you type `/words`.

When the count reaches above 50, it will be resetted. This way it starts over again to make sure users will still be able to chat in a reasonable way.

You can also type `/commands` to checkout all commands.

* If you type a color command the background color on every users screen will change to that color. 
* If you type a word thas has already been used, it tells you which word it is and how many current words there are.
* If you type a command that doesn't exist, it tells you the command does not exist + a list with available commands.

### Socket server events
##### General
* `connect`

This is a built in socket wich activates when a user connects.

* `disconnect`

This is a built in socket wich activates when a user disconnects.

##### Chat messages
* `send-chat-message`

General text message.

* `your-chat-message`

Chat messages from yourself.

* `their-chat-message`

Chat messages from every user except you.

* `new-user`

This will add a chat message with info about who joined the chat.

##### Commands
* `send-command`

##### Server messages
* `word-already-used`

### Socket client listeners
##### Connections
* `user-connected`

* `user-disconnected`

##### Chat messages
* `your-chat-message`

* `their-chat-message`

##### Commands
* `personal-command-executed`

I have devided the commands, I made personal and global. The personal commands will only affect the user who sent it. Some personal commands are: `/commands` and `/words`.

* `global-command-executed`

Global commands will affect everyone, I've made commands to be able to change the background color of everyones chat. This is broadcasted. These commands are `/red`, `/blue`, `/orange`, `/yellow`, `/green`, `/black` and `/white`.

##### Server messages
* `word-already-used`

This will tell the user when he sends a words that has already been used, it tells the user he cannot use that word and how many unique words are currently used. This will tell the user to do `/words` to be able to see all words that have been used.

* `command-not-existing`

This will tell the user the command does not exist, plus all existing commands that are available.

##### Server updates
* `online-users`

Updates online user amount

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

* [MDN](https://developer.mozilla.org/nl/) - Main source for javascript code
* [Socket.io](https://socket.io/) - For documentation about socket.io
* [This socket.io tutorial](https://www.youtube.com/watch?v=rxzOqP9YwmM&t=926s) - It helped me setup the basics of my project

## Check it out!

* [Click here to open the live link](https://frozen-refuge-52748.herokuapp.com/)

## License

MIT © Stefan Gerrits