import Migi, { command, on } from '../lib'

class Ping {
	@command(/^ping(?: (.*))?$/)
	ping({ channel }, arg) {
		channel.send(`Ping ${arg}!`)
	}

	@on('ready')
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
