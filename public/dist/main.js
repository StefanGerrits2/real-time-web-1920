const socket = io();

socket.on('connect', function(){
    console.log('connection to server made');
});