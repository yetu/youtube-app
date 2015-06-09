/* global module */

/**
 * Configuration for remote control service. It contains:
 * - keys: key binding for simulating remote controls with keyboard
 * - controllers: controller actions configuration, which can contain:
 *      - order: order of modules used for navigation between them
 *      - special: special action to be executed if particular key is pressed, can be:
 *              - activate: activation of other module
 *              - ... TODO, WIP, not implemented and used yet
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
    
    controllers: {
        dashboard: {
            order: ['search', 'input', 'result'],
            first: 1,
            special: {
                menu: {activate: 'search' },
                quit: {}
            }
        },
        viewer: {
            order: ['search', 'player', 'playlist'],
            first: 1,
            passthrough: {
                player: 'controlbar'
            },
            special: {
                menu: {activate: 'search'},
                quit: {}
            }
        }
    }
});