import { hooks, initHooks } from '../Migi';

export default function command(regex, options = {}) {
	return (target, key, descriptor) => {
		initHooks(target);
		target[hooks].push((migi, that) => {
			migi.command(regex, that, key, options);
		});
		return descriptor;
	};
}
