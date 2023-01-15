let today= new Date();

exports.getDate = function () {

    options = {
        weekday : "long",
        day : "numeric",
        month : "long",
        year : "numeric"
    }
    return today.toLocaleDateString("en-US", options);

}


exports.getDay = function () {

    options = {
        weekday : "long",
    }
    return today.toLocaleDateString("en-US", options);

}