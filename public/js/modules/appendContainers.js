function appendMessage(msg, type, multipleChoice, answers){
    // Outer message div
    const outerMessage = document.createElement('div');
    outerMessage.classList.add('outer-message');
    outerMessage.classList.add(type);

    // Message text
    const newMessage = document.createElement('p');
    newMessage.classList.add('message');
    newMessage.textContent = msg;

    outerMessage.appendChild(newMessage);

    // If it's a multiplechoice question, append buttons
    if (multipleChoice) {
        const text = document.createElement('p');
        text.textContent = 'Multiple choice! you can only guess 1 of these answers.';
        outerMessage.appendChild(text);

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'button__container';

        // Create answers
        answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer';
            button.textContent = answer;
            buttonContainer.appendChild(button);
        });

        outerMessage.appendChild(buttonContainer);
    }

    if (type === 'next-round' || 'question') {
        const loader = document.createElement('div');
        outerMessage.appendChild(loader);
    }

    document.querySelector('#messages__container').appendChild(outerMessage);
    scrollToBottom();
};

// Append scoreboard
function appendScoreboard(data, type){
    // Outer message div
    const outerMessage = document.createElement('div');
    outerMessage.classList.add('outer-message');
    outerMessage.classList.add(type);

    // Message text
    const title = document.createElement('p');
    title.classList.add('title');
    title.textContent = 'Game over, scores:';

    outerMessage.appendChild(title);

    let number = 0;

    data.forEach(user => {
        number++;
        const score = document.createElement('p');
        score.textContent = '#' + number + ' ' + user.name + ': ' + user.points;
        outerMessage.appendChild(score);
    });

    // TIMER
    // Message text
    const sentence = document.createElement('p');
    sentence.textContent = 'You will be sent to the homepage in';

    const timer = document.createElement('p');
    timer.id = 'timer-game-over';
    timer.textContent = '15';

    const seconds = document.createElement('p');
    seconds.textContent = 'seconds';

    const timerContainer = document.createElement('div');
    timerContainer.id = 'timer__container2';

    timerContainer.appendChild(sentence);
    timerContainer.appendChild(timer);
    timerContainer.appendChild(seconds);

    outerMessage.appendChild(timerContainer);

    document.querySelector('#messages__container').appendChild(outerMessage);
};

// Scroll to bottom when message is sent/received
function scrollToBottom() {
    document.querySelector('#messages__container').scrollTo(0, document.body.scrollHeight);
}

export default { 
    appendMessage, 
    appendScoreboard 
};