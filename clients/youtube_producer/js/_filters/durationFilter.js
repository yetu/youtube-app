/* global module */
/*
 * Duration Filter to convert the youtube duration or integer seconds to format [hh:]mm:ss
 */
module.exports = (function() {
    return function(time) {
        var array = [];
        
        if(typeof time === 'number') {
            var hours = parseInt(time / 3600) % 24;
            var minutes = parseInt(time / 60) % 60;
            var seconds = parseInt(time % 60);
            array = [minutes, seconds];
            if(hours) {
                array.unshift(hours);
            }
        } else if(typeof time !== 'undefined') {
            // http://stackoverflow.com/a/19094191
            array = (time || '').match(/(\d+)(?=[MHS])/ig);
        } else {
            return '';
        }

        if(array.length === 1) {
            array.unshift('0');
        }

        return array.map(function(item) {
            if((''+item).length < 2) return '0' + item;
            return item;
        })
        .join(':');
    };
});