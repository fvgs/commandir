const {rmdir: fsRmdir} = require ('fs')
const {isString, isArray} = require ('../utils')

module.exports = rmdir

async function rmdir (dirs, ...args) {
	if (args.length > 0) {
		const err = new Error (
			'Invalid number of arguments. The function expects a single string or array of strings'
		)
		throw {err, dirs: []}
	}

	if (isString (dirs)) {
		let removedDir
		try {
			removedDir = await rmdirHelper (dirs)
		} catch (err) {
			throw {err, dirs: []}
		}
		return removedDir ? [removedDir] : []
	}
	if (isArray (dirs) && dirs.every (isString)) {
		const sortedDirs = dirs.sort ((a, b) => b.localeCompare (a))
		const removedDirs = []
		let err

		for (let dir of sortedDirs) {
			let removedDir
			try {
				removedDir = await rmdirHelper (dir)
			} catch (error) {
				if (!err) err = error
				continue
			}
			if (removedDir) removedDirs.push (removedDir)
		}

		if (err) throw {err, dirs: removedDirs}
		return removedDirs
	}

	const err = new Error (
		'Received argument of invalid type. The function expects a single string or array of strings'
	)
	throw {err, dirs: []}
}

async function rmdirHelper (dir) {
	return new Promise ((resolve, reject) => {
		fsRmdir (dir, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					resolve ()
					return
				}

				reject (err)
				return
			}

			resolve (dir)
		})
	})
}
