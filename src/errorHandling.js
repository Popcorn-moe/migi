import { red, white, yellow, black } from 'chalk'
import umaru from 'umaru-chan' //don't ask
import { Migi, GuildChannel } from '.'

/**
 * Log an error to stderr and as an embed to the channel if specified
 *
 * @param {GuildChannel | Migi} inst the migi or channel instance
 * @param {any} error the thrown error
 * @param {string} message a simple message describing where the error occured
 */
export function error(inst, error, message, ...args) {
	const channel = !(inst instanceof Migi) && inst
	const migi = channel ? inst.client : inst

	args.forEach(
		(arg, i) =>
			(message = message.replace('$' + i, '"' + black.bgRed(arg) + '"'))
	)

	const { errorFooter } = migi.settings

	console.error(red.bold(message))
	console.error(red.bold('Stack: ') + red((e && e.stack) || '' + e))
	console.error(red.italic.bold(errorFooter))

	return channel && sendDiscordError(migi, message, error)
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
		.setImage(umaru(errorEmbedImages))
		.setFooter(errorFooter, errorIcon)
		.setTimestamp()

	description && embed.setDescription(description)

	return channel
		.send(embed)
		.then(
			message =>
				errorEmbedDeleteTimeout && message.delete(errorEmbedDeleteTimeout)
		)
		.catch(err =>
			error(
				migi,
				err,
				'Error while displaying error message in discord channel $1',
				channel.id
			)
		)
}

export function warn(migi, message, ...args) {
	args.forEach(
		(arg, i) =>
			(message = message.replace('$' + i, '"' + white.bgYellow(arg) + '"'))
	)

	console.warn(yellow.bold('Warning: ') + yellow(message))
	console.warn(yellow.italic.bold(migi.settings.errorFooter))
}

//Error handler
export function errHandle(fn, onErr) {
	return (...args) => {
		try {
			const ret = fn(...args)
			return ret && ret.catch ? ret.catch(e => onErr(e, ...args)) : ret
		} catch (e) {
			return onErr(e, ...args)
		}
	}
}
