export default function restrict(func) {
	return (target, key, descriptor) => {
		const wrapped = descriptor.value
		descriptor.value = async function(...fnargs) {
			if (await func(fnargs[0])) {
				return wrapped.apply(this, fnargs)
			}
		}
		return descriptor
	}
}
