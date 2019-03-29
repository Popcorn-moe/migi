# Migi

[![npm](https://img.shields.io/npm/v/@popcorn.moe/migi.svg)](https://www.npmjs.com/package/@popcorn.moe/migi)

![logo](https://vignette.wikia.nocookie.net/kiseijuu/images/0/0c/Migi.png)
Our right hand to write Discord bots

## Examples

### With decorators (Need [babel](https://github.com/babel/babel))

```javascript
/**
 * You may import migi don't forget to run "npm install @popcorn.moe/migi" (if you use npm or see how to use yarn)
 */
import Migi, { command, on } from '@popcorn.moe/migi'

/**
 * A class is a Module for Migi
 */
class Ping {

	/**
	 * Create a command by passing a regex in the @command annotation
	 * Every arguments is given by discord.js (channel) 
	 * and you have "args" its a string of every arguments passed on this command
	 */
	@command(/^ping(?: (.*))?$/)
	ping({ channel }, arg) {
		channel.send(`Ping ${arg}!`)
	}

	/**
	 * Register a event by passing a event name in the @on annotation
	 * The method who is annoted with this annotation will be execute when the event is called
	 * Every arguments is given by discord.js
	 */
	@on('ready')
	onReady() {
		console.log('Ready')
	}

}

//Create a new Migi instance
const migi = new Migi({
	root: __dirname
})

//Just load the module 'Ping'. if you don't do that your code will never be runned 
migi.loadModule(Ping)

//Say Ready XXXXX when your bot is ready ...
migi.on('ready', () => console.log(`Ready @${migi.user.tag}`))

//Connect migi with your DISCORD_TOKEN
migi.login(process.env.DISCORD_TOKEN)
```

### Without decorators

```javascript
/**
 * You may import migi don't forget to run "npm install @popcorn.moe/migi" (if you use npm, or see how to use yarn)
 */
const { Migi } = require('@popcorn.moe/migi')

/**
 * A class is a Module for Migi
 */
class Ping {

	/**
	 * Here you have an instance of migi
	 * In the constructor if you don't use babel you may register your command, and listen some events
	 */
	constructor(migi) {
		/**
		 * Register a command by passing in the first arguments the regex, 
		 * secondly the module (here) and lastly the name of the function to run
		 */
		migi.command(/^ping(?: (.*))?$/, this, 'ping')

		/**
		 * Here you can listen some events just by using the listen function.
		 * In first you may give the event name, secondly the module (here), lastly the function to run
		 */ 
		migi.listen('ready', this, 'onReady')
	}

	/**
	 * Every arguments is given by discord.js (channel) 
	 * and you have "args" its a string of every arguments passed on this command
	 */ 
	ping({ channel }, arg) {
		channel.send(`Ping ${arg}!`)
	}

	/**
	 * Every arguments is given by discord.js
	 */ 
	onReady() {
		console.log('Ready')
	}
}

//Create a new Migi instance
const migi = new Migi({
	/* Used to read the config */
	root: __dirname,
	/* Trigger your bot when you update a message (like a command) */
	messagesUpdate: true
})

//Just load the module 'Ping'. if you don't do that your code will never be runned 
migi.loadModule(Ping)

//Say Ready XXXXX when your bot is ready ...
migi.on('ready', () => console.log(`Ready @${migi.user.tag}`))

//Connect migi with your DISCORD_TOKEN
migi.login(process.env.DISCORD_TOKEN)
```

You can see a list of every events [here](https://discord.js.org/#/docs/main/stable/class/Client)
Documentation of discord.js [here](https://discord.js.org/#/docs/main/stable/general/welcome)