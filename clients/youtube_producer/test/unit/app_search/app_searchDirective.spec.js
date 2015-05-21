'use strict';

describe('Directive: app_search', function () {
    var $compile, scope, $timeout;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, $rootScope, _$timeout_){
        $compile = _$compile_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
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
        scope.$digest();
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

    it('should react on enter on key up', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).triggerHandler({type: 'keyup', keyCode: 13});
        expect(elementScope.$emit).toHaveBeenCalledWith('app:search-value', 'yetu');
        expect(elementScope.emitted).toBe('yetu');
    });

    it('should not react on enter on key down', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).triggerHandler({type: 'keydown', keyCode: 13});
        expect(elementScope.$emit).not.toHaveBeenCalled();
        expect(elementScope.emitted).not.toBe('yetu');
    });

    it('should not react on other key on key up', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).triggerHandler({type: 'keyup', keyCode: 65});
        expect(elementScope.$emit).not.toHaveBeenCalled();
        expect(elementScope.emitted).not.toBe('yetu');
    });

    it('should reset search', function() {
        var element = $compile('<app-search trigger-search="button" value="test"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.emitted).toBe('test');
        elementScope.$emit.calls.reset();
        element.find('input').eq(0).prop('value', '');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-reset");
        expect(elementScope.emitted).toBe('');
    });

    xit('should debounce input value', function() {
        var element = $compile('<app-search trigger-search="auto"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).prop('value', 'ye');
        element.find('input').eq(0).prop('value', 'yetu');
        $timeout.flush();  // TODO: $timeout(function() { expect... } does not work in tests either, expect does not get called
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-value", "yetu");
        expect(elementScope.emitted).toBe('yetu');
    });

    xit('should not debounce empty input value', function() {
        var element = $compile('<app-search trigger-search="auto"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).prop('value', 'ye');
        element.find('input').eq(0).prop('value', '');
        expect(elementScope.$emit).not.toHaveBeenCalled();
        $timeout.flush();  // TODO: seems not to work correctly, compare test above...
        expect(elementScope.$emit).not.toHaveBeenCalled;
        expect(elementScope.emitted).toBeUndefined();
    });
});