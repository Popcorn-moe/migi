import { Client } from 'discord.js'

const MIGI_DATA = Symbol('migi')

export function isModule(instance) {
	return !!(instance.constructor && instance.constructor[MIGI_DATA])
}

export function getMigiData(obj) {
	return obj[MIGI_DATA]
}

export default class Migi extends Client {
	constructor({ discordOptions, root = process.cwd() } = {}) {
		super(discordOptions)
		this._root = root
		this._modules = []
	}

	get root() {
		return this._root
	}

	loadModule(ModuleConstructor) {
		const migi = this

		// init module data
		ModuleConstructor[MIGI_DATA] = {
			_listeners: [],
			_instance: null,
			get listeners() {
				return Object.freeze(this._listeners.slice())
			},
			get instance() {
				return this._instance
			},
			get loaded() {
				return !!this._instance
			},
			get name() {
				return ModuleConstructor.name
			},
			get migi() {
				return migi
			}
		}

		const module = new ModuleConstructor(this)
		getMigiData(ModuleConstructor)._instance = module

		// add module
		this._modules.push(module)
		this.emit('moduleLoad', module)

		return module
	}

	unloadModule(module) {
		if (!isModule(module) || !this.isModuleLoaded(module))
			throw new Error('instance must a loaded module instance')

		const migiData = getMigiData(module.constructor)
		migiData._instance = null // set unloaded

		// remove listeners
		migiData._listeners.forEach(listener => {
			const { event } = getMigiData(listener)
			this.emit('listenerRemove', module, event, listener)
			this.removeListener(event, listener)
		})

		// remove module
		this.emit('moduleUnload', module)
		this._modules.remove(module)
	}

	listen(module, event, listener) {
		if (!isModule(module) || !this.isModuleLoaded(module))
			throw new Error('module must be a loaded module instance')
		if (typeof event !== 'string') throw new Error('event must be a string')
		if (typeof listener !== 'function')
			throw new Error('listener must be a function')

		// init listener data
		listener[MIGI_DATA] = {
			get module() {
				return module
			},
			get event() {
				return event
			},
			get handler() {
				return listener
			}
		}

		// add listener
		getModuleData(module.constructor)._listeners.push(listener)
		this.emit('listenerAdd', module, event, listener)
		this.on(event, listener)
	}

	isModuleLoaded(module) {
		if (!isModule(module)) throw new Error('module must be a module instance')

		return !!getModuleData(module.constructor).instance
	}
}
