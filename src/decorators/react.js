export default function react(reaction) {
	return (target, key, descriptor) => {
		const wrapped = descriptor.value
		descriptor.value = function(...fnargs) {
			fnargs[0].react(reaction)
			return wrapped.apply(this, fnargs)
		}
		return descriptor
	}
}
