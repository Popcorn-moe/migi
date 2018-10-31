import Migi from '@popcorn.moe/migi'

// Unicorn module
class Unicorn {
  constructor(migi) {
    this.migi = migi
    migi.listen(this, 'message', this.onMessage)
    migi.listen(this, 'ready', this.onReady)
  }

  onReady() {
    console.log(`Ready ${this.migi.user.tag}!`)
  }

  onMessage(message) {
    console.log(`Received message: ${message.content}`)

    if (message.content === 'unload') {
      this.migi.unloadModule(this)
      console.log(`Goodbye`)
    }
  }
}

const migi = new Migi({ root: __dirname })

migi.loadModule(Unicorn)
migi.login(process.env.DISCORD_TOKEN)
