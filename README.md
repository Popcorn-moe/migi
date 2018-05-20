# Migi

[![npm](https://img.shields.io/npm/v/@popcorn.moe/migi.svg)](https://www.npmjs.com/package/@popcorn.moe/migi)

![logo](https://vignette.wikia.nocookie.net/kiseijuu/images/0/0c/Migi.png)
Our right hand to write Discord bots

## Examples

### With decorators (Need babel)

```javascript
import Migi, { command, on } from '@popcorn.moe/migi'

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
```

### Without decorators

```javascript
const { Migi } = require('@popcorn.moe/migi')

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
```