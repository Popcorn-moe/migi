import { Client } from 'discord.js'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import mkdirp from 'mkdirp'
import { join, dirname } from 'path'
import json5 from 'json5'
import merge from 'deepmerge'

export const hooks = Symbol('hooks')

export function initHooks(target) {
	if (!(hooks in target)) target[hooks] = []
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
					prefix: '/'
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
			const listener = this._call.bind(this, module, key)
			this._modules.get(module).listeners.push([event, listener])
			this.on(event, listener)
		} else {
			initHooks(module)
			module[hooks].push((migi, that) => migi.listen(event, that, key))
		}
	}

	command(regex, module, key, options = {}) {
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
				.split(`\n`)
				.map((line, i, { length }) => {
					if (i > 0 && i != length - 1) return `//${line}`
					else return line
				})
				.join('\n')
			writeFileSync(path, config, 'utf-8')
			return defaultConfig
		}
	}

	_onMessage(message) {
		const { content } = message

		for (const [module, { commands }] of this._modules.entries()) {
			for (const [regex, key, { prefix = true }] of commands) {
				if (prefix && !content.startsWith(this.settings.prefix)) continue
				const result = regex.exec(
					prefix ? content.slice(this.settings.prefix.length) : content
				)

				if (result) this._call(module, key, message, ...result.slice(1))

				regex.lastIndex = 0
			}
		}
	}

	_call(module, key, ...args) {
		module[key](...args)
	}
}
