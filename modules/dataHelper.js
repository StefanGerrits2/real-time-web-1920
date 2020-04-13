function dataHelper(data) {
    return {
        ...data,
        tempInCelcius: data.main.temp - 274.15 + ' celcius'
    };
};

module.exports = dataHelper;