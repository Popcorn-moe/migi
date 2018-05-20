export default function configurable(name, defaultSettings) {
	return Module => {
		return class extends Module {
			constructor(migi) {
				super(migi, migi.loadConfig(name, defaultSettings));
			}
		};
	};
}
