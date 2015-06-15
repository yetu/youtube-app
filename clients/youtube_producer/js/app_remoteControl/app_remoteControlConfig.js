/* global module */

/**
 * Configuration for remote control service. It contains:
 * - keys: key binding for simulating remote controls with keyboard
 * - special: general key handler - mainly for controllers independent actions - for particular key action can be:
 *      - route: change location path to given
 *      - ...
 * - controllers: controller actions configuration (key as name used by setController method), which can contain:
 *      - order: order of modules used for navigation between them
 *      - special: special action to be executed if particular key is pressed, can be:
 *              - activate: activation of other module
 *              - send: calls given method to yetu library
 *      - passthrough: passes event to other module if currentmodule is active now (syntax: { currentmodule: 'other' })
 */

module.exports = ({
    // key configuration to simulate remote control events with keyboard
    keys: {
        87: 'up',    // w
        65: 'left',  // a
        68: 'right', // d
        69: 'enter', // e
        83: 'down',  // s
        81: 'quit',  // q
        72: 'home',  // h
        77: 'menu',  // m
        80: 'play'   // p
    },

    special: {
        home: {
            route: '/'
        }
    },
    
    controllers: {
        dashboard: {
            order: ['input', 'result'],
            first: 0,
            special: {
                menu: { activate: 'search' },
                quit: { send: 'sendQuit' }
            }
        },

        // viewer has different controls based on display type
        'viewer-fullscreen': {
            order: ['playlist', 'player'],
            first: 1,
            passthrough: {
                player: ['controlbar']
            }
        },
        'viewer-expand': {
            order: ['search', 'playlist'],
            first: 1
        },
        'viewer-normal': {
            order: ['search', 'playlist'],
            first: 1
        },
        'viewer-undefined': {
            order: ['search', 'playlist'],
            first: 1
        }
    }
});