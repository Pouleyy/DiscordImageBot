function arrayToString(array) {
    return array.reduce((prev, cur) => prev + ", " + cur);
}

function divideInMultipleArrays(array, length) {
    let returnArray = [];
    if (array.length == 1) return array;
    if (array.length > length) { //Because field value is limited to 1024 char
        while (array.length) {
            returnArray.push(array.splice(0, Math.round(length / 2)));
        }
    } else {
        let length = array.length % 2 == 0 ? array.length : array.length + 1;
        returnArray.push(array.slice(0, length / 2));
        returnArray.push(array.slice(length / 2, array.length));
    }

    return returnArray;
}

function extractName(array, prefix) {
    return array.map(element => prefix + element.name);
}

export default {
    arrayToString,
    divideInMultipleArrays,
    extractName,
}