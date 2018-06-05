export default function autodelete() {
	return (target, key, descriptor) => {
		const wrapped = descriptor.value
		descriptor.value = async function(...fnargs) {
			const res = await wrapped.apply(this, fnargs)
			fnargs[0].delete()
			return res
		}
		return descriptor
	}
}
