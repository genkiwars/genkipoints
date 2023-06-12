const { setTimeout } = require("timers/promises");
const array = [1, 2, 3, 4, 5]

const yourFunction = async () => {

    for (const arr in array) {

        console.log(arr)
        await setTimeout(60000);
    }

    
};

yourFunction()