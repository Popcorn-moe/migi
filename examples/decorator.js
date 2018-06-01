import Migi, { command, on, restrict } from '../lib'

class Ping {
	@command(/^ping(?: (.*))?$/)
	@restrict(({ member }) => member.roles.some(({ name }) => name == 'Admin'))
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
