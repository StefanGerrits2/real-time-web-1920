// Update online users and scores
export default function updateOnlineUsers(users, currentRound) {
    // Round x of x
    const roundInfo = document.querySelector('#roundInfo');
    roundInfo.textContent = `Round ${currentRound} of ${users.length}`;

    // Reset
    document.querySelector('#scores').textContent = '';

    // Sort on score
    // Source: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    const sortedScores = users.sort((a, b) => (a.points < b.points) ? 1 : -1);

    let number = 0;

    // Reappend 
    sortedScores.forEach(user => {
        number++;

        // Super container
        const superContainer = document.createElement('div');
        superContainer.id = 'supercontainer';

        // Text container
        const leftContainer = document.createElement('div');
        leftContainer.id = 'user-number__container';

        // Text container
        const middleContainer = document.createElement('div');
        middleContainer.id = 'user-points__container';

        // Icon container
        const rightContainer = document.createElement('div');
        rightContainer.id = 'icon__container';

        if (user.role === 'question-picker') {
            const icon = document.createElement('img');
            icon.src = 'images/think.png';
            rightContainer.appendChild(icon);
        }

        const name = document.createElement('p');
        const points = document.createElement('p');
        const place = document.createElement('p');

        name.textContent = user.name;
        points.textContent = 'Points: ' + user.points;
        place.textContent = '#' + number;

        leftContainer.appendChild(place);

        middleContainer.appendChild(name);
        middleContainer.appendChild(points);

        superContainer.appendChild(leftContainer);
        superContainer.appendChild(middleContainer);
        superContainer.appendChild(rightContainer);

        document.querySelector('#scores').appendChild(superContainer);
    });
}