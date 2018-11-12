const colors = [
    'system',
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
    'whiteBright'
]
const fonts = [
    'block',
    '3d'
]

exports.colors = colors[Math.floor(Math.random()*colors.length)]
exports.fonts = fonts[Math.floor(Math.random()*fonts.length)]