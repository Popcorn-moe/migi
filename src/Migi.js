import { Client, RichEmbed } from 'discord.js'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import mkdirp from 'mkdirp'
import { join, dirname } from 'path'
import json5 from 'json5'
import merge from 'deepmerge'

export const hooks = Symbol('hooks')

export function initHooks(target) {
	if (!(hooks in target)) target[hooks] = []
}

function toArray(elem) {
	if (Array.isArray(elem)) return elem
	else return [elem]
}

export function sendDiscordError(channel, message, description) {
	const migi = channel.client
	const {
		errorFooter,
		errorEmbedDeleteTimeout,
		errorEmbedColor,
		errorEmbedImages,
		errorIcon
	} = migi.settings

	const embed = new RichEmbed()
		.setColor(errorEmbedColor)
		.setTitle(message)
		.setImage(
			errorEmbedImages[Math.floor(Math.random() * errorEmbedImages.length)]
		)
		.setFooter(errorFooter, errorIcon)
		.setTimestamp()

	description && embed.setDescription(description)

	return channel
		.send(embed)
		.then(
			message =>
				errorEmbedDeleteTimeout && message.delete(errorEmbedDeleteTimeout)
		)
}

export default class Migi extends Client {
	constructor({ discordjs, root = process.cwd(), settings = {} } = {}) {
		super(discordjs)
		this.root = root
		this._modules = new Map()
		this.on('message', message => this._onMessage(message))
		this.settings = this.loadConfig(
			'global',
			merge(
				{
					prefix: '/',
					errorFooter: 'Please fix me senpaiiii!',
					errorEmbedDeleteTimeout: null,
					errorEmbedColor: 0xdb1348,
					errorEmbedImages: ['https://i.imgur.com/6EgeVjX.gif'],
					errorIcon: null
				},
				settings
			)
		)
	}

	loadModule(Module) {
		const module = new Module(this)
		this._modules.set(module, {
			listeners: [],
			commands: []
		})

		if (module[hooks]) for (const hook of module[hooks]) hook(this, module)

		return module
	}

	unloadModule(module) {
		const { listeners } = this._modules.get(module)
		for (const [event, listener] of listeners) {
			if (event === 'unload') listener()
			else this.removeListener(event, listener)
		}
		this._modules.remove(module)
	}

	get modules() {
		return this._modules.keys()
	}

	listen(event, module, key) {
		if (this._modules.has(module)) {
			const listener = (...args) => module[key](...args)
			this._modules.get(module).listeners.push([event, listener])
			this.on(event, listener)
		} else {
			initHooks(module)
			module[hooks].push((migi, that) => migi.listen(event, that, key))
		}
	}

	command(regex, module, key, options = {}) {
		if (typeof options.prefix === 'function')
			options.prefix = options.prefix(this)

		if (this._modules.has(module)) {
			this._modules.get(module).commands.push([regex, key, options])
		} else {
			initHooks(module)
			module[hooks].push((migi, that) =>
				migi.command(regex, that, key, options)
			)
		}
	}

	loadConfig(name, defaultConfig) {
		const path = join(this.root, 'settings', `${name}.json5`)
		mkdirp.sync(dirname(path))
		if (existsSync(path))
			return merge(defaultConfig, json5.parse(readFileSync(path, 'utf-8')))
		else {
			const config = json5
				.stringify(defaultConfig, {
					space: '\t'
				})
				.split('\n')
				.map((line, i, { length }) => {
					if (i > 0 && i != length - 1) return `//${line}`
					else return line
				})
				.join('\n')
			writeFileSync(path, config, 'utf-8')
			return defaultConfig
		}
	}

	async _onMessage(message) {
		const { content, channel } = message

		for (const [module, { commands }] of this._modules.entries()) {
			for (const [regex, key, { prefix: cPrefix }] of commands) {
				for (const prefix of toArray(cPrefix || this.settings.prefix)) {
					const toMatch =
						typeof prefix === 'function' ? prefix(message) : prefix
					if (toMatch && !content.startsWith(toMatch)) continue

					const [match, ...args] =
						regex.exec(toMatch ? content.slice(toMatch.length) : content) || []

					if (match) {
						try {
							channel.startTyping()
							await module[key](message, ...args)
						} catch (err) {
							sendDiscordError(
								message.channel,
								`Error while dispatching command "${match}" to module ${
									module.constructor.name
								}`,
								err
							)
							throw err
						} finally {
							channel.stopTyping()
						}
					}

					regex.lastIndex = 0
				}
			}
		}
	}
}
