class CustomError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

function snakeCaseToCamelCaseConverter(snakeString) {
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

module.exports = { CustomError, snakeCaseToCamelCaseConverter };
