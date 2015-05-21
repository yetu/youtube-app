/* global module */
module.exports = ({
    dashboard: {
        order: ['search', 'list-1', 'list-2'],
        special: {
            menu: {activate: 'search' },
            quit: {}
        }
    },
    viewer: {
        order: [/*'search',*/ 'player', 'playlist'],
        special: {
            menu: {activate: 'search'},
            quit: {}
        }
    }
});