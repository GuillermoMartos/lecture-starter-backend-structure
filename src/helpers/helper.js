class CustomError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

function convertSnakeCaseToCamelCase(snakeString) {
    const str = snakeString;
    let jump = false;
    const result = Array.from(str).map((letter, ind) => {
        if (jump) {
            jump = false;
            return '';
        }
        if (letter === '_') {
            jump = true;
            return str[ind + 1].toUpperCase();
        }
        return letter;
    });

    return result.join('');
}

function convertCamelCaseToSnakeCase(camelString) {
    const str = camelString;
    const result = Array.from(str).map((letter, ind) => {
        if (letter === letter.toUpperCase()) {
            return `_${letter.toLowerCase()}`;
        }
        return letter;
    });

    return result.join('');
}

function isCamelCase(string) {
    return Array.from(string).some((letter) => letter === letter.toUpperCase());
}

function convertObjectPropertiesToSnakeCase(receivedObj) {
    const objectCopy = structuredClone(receivedObj);
    Object.keys(receivedObj).forEach((key) => {
        if (typeof objectCopy[key] === 'object') {
            objectCopy[key] = convertObjectPropertiesToSnakeCase(objectCopy[key]);
        }
        if (isCamelCase(key)) {
            const newKey = convertCamelCaseToSnakeCase(key);
            delete objectCopy[key];
            objectCopy[newKey] = receivedObj[key];
        }
    });
    return objectCopy;
}

module.exports = {
    CustomError,
    convertSnakeCaseToCamelCase,
    convertObjectPropertiesToSnakeCase,
};
