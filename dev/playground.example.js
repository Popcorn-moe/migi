import Migi, { command, on } from '../src'

class Test {
	@command(/^test$/)
	test(msg) {
		lol
	}

	@on('ready')
	onReady() {
		console.log('Ready')
	}
}

const migi = new Migi({
	root: __dirname
})

migi.loadModule(Test)

migi.on('ready', () => console.log(`Ready @${migi.user.tag}`))

migi.login(process.env.DISCORD_TOKEN)