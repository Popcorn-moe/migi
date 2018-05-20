import { hooks, initHooks } from "../Migi"

export default function on(event) {
	return (target, key, descriptor) => {
		initHooks(target)	
		target[hooks].push((migi, that) => {
			migi.listen(event, that, key)
		})
		return descriptor;
	};
}