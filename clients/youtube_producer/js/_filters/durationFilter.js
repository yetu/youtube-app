/* global module */
/*
 * Duration Filter to convert the youtube duration to format hh:mm:ss
 */
module.exports = (function() {
    return function(time) {
        // http://stackoverflow.com/a/19094191
        var array = (time || '').match(/(\d+)(?=[MHS])/ig) || [];
        if(array.length === 1) {
            array.unshift('0');
        }
        return array.map(function(item) {
            if(item.length < 2) return '0' + item;
            return item;
        })
        .join(':');
    };
});