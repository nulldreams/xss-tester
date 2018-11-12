const { start } = require('./src/server')
const { colors, fonts } = require('./src/utils')
const program = require('commander')
const cfonts = require('cfonts')

cfonts.say('XSS-Tester', {
    font: fonts,
    align: 'left',
    colors: [colors],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    maxLength: '0'
})

program.version('0.0.1').description('Simple server to test XSS scripts')

program.command('start').description('starts the server').option('-p, --port <port>', 'port number').action (async (options) => {
    start(options.port)
})

program.parse(process.argv)