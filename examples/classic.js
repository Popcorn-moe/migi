const { Migi } = require('../lib')

class Ping {
	constructor(migi) {
		migi.command(/^ping(?: (.*))?$/, this, 'ping')
		migi.listen('ready', this, 'onReady')
	}

	ping({ channel }, arg) {
		channel.send(`Ping ${arg}!`)
	}

	onReady() {
		console.log('Ready')
	}
}

const migi = new Migi({
	root: __dirname
})

migi.loadModule(Ping)

migi.on('ready', () => console.log(`Ready @${migi.user.tag}`))

migi.login(process.env.DISCORD_TOKEN)
