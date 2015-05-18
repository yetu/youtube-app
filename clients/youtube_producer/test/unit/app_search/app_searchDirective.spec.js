'use strict';

describe('Directive: app_search', function () {
    var $compile,
        scope;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, $rootScope){
        $compile = _$compile_;
        scope = $rootScope.$new();
    }));

    it('should compile to div with default class with input and button elements inside', function() {
        var element = $compile('<app-search></app-search>')(scope);
        scope.$digest();
        expect(element.find('div').eq(0).attr('class')).toBe('app-search');
        expect(element.find('input').eq(0).attr('class')).toContain('query');
        expect(element.find('input').eq(0).attr('type')).toBe('text');
        expect(element.find('button').eq(0).attr('class')).toBe('search');
    });

    it('should compile element properly with placeholder and value', function() {
        var element = $compile('<app-search placeholder="enter search value" value="some search value"></app-search>')(scope);
        scope.$digest();
        expect(element.find('input').eq(0).attr('placeholder')).toBe('enter search value');
        expect(element.find('input').eq(0).attr('value')).toBe('some search value');
    });

    it('should react on click', function() {
        var element = $compile('<app-search trigger-search="button" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-value", "yetu");
        expect(elementScope.emitted).toBe('yetu');
    });

    it('should not react on click', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).not.toHaveBeenCalled();
        expect(elementScope.emitted).not.toBe('yetu');
    });

    xit('should react on enter', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        // TODO: integrate jQuery or use another way to create key event
        var e = jQuery.Event("keydown", {
            keyCode: 13
        });
        element.trigger(e);
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-value");
        expect(elementScope.emitted).toBe('yetu');
    });

    it('should reset search', function() {
        var element = $compile('<app-search trigger-search="button" value="test"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.emitted).toBe('test');
        element.find('input').eq(0).attr('value', '');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-reset");
        expect(elementScope.emitted).toBe('');
    });

    it('should react on what? (triggerAuto)', function() {
        var element = $compile('<app-search trigger-search="auto" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-value", "yetu");
        expect(elementScope.emitted).toBe('yetu');
    });

});