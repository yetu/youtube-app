'use strict';

describe('Filter: nl2br', function () {
    var filter;

    beforeEach(module('_filters'));

    beforeEach(inject(function(nl2brFilter){
        filter = nl2brFilter;
    }));

    it('should replace new lines by br tag', function() {
        expect(filter('This is a text\nrunning on several\nlines.')).toBe('This is a text<br/>running on several<br/>lines.');
        expect(filter()).toBe('');
        expect(filter('This is a line without line breaks.')).toBe('This is a line without line breaks.');
    });

});