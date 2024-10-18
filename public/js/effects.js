function createSnowflake() {
    const snowContainer = document.querySelector('.snow-container');

    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');

    const sizeClass = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
    snowflake.classList.add(sizeClass);

    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';

    snowflake.style.animationName = 'fall, sway';
    snowflake.style.animationTimingFunction = 'ease-in';
    snowflake.style.animationIterationCount = 'infinite';
    snowflake.style.animationDelay = Math.random() + 's';

    snowContainer.appendChild(snowflake);


    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}

setInterval(createSnowflake, 200);
