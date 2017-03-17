const {mkdir: fsMkdir, rmdir: fsRmdir} = require ('fs')
const {dirname} = require ('path')

module.exports = {mkdir, rmdir}

function isString (val) {
	return Object.prototype.toString.call (val) === '[object String]'
}

function isArray (val) {
	return Object.prototype.toString.call (val) === '[object Array]'
}

async function mkdir (dirs, ...args) {
	if (args.length > 0) {
		const err = new Error (
			'Invalid number of arguments. The function expects a single string or array of strings'
		)
		throw {err, dirs: []}
	}

	if (isString (dirs)) return await mkdirHelper (dirs)
	if (isArray (dirs) && dirs.every (isString)) {
		let err
		let dirPromises = dirs.map (mkdirHelper)
		dirPromises = dirPromises.map (async (dirPromise) => {
			try {
				return await dirPromise
			} catch ({err: error, dirs: createdDirs}) {
				if (!err) err = error
				return createdDirs
			}
		})

		let createdDirs = await Promise.all (dirPromises)
		createdDirs = [].concat (...createdDirs)

		if (err) throw {err, dirs: createdDirs}
		return createdDirs
	}

	const err = new Error (
		'Received argument of invalid type. The function expects a single string or array of strings'
	)
	throw {err, dirs: []}
}

async function mkdirHelper (dir) {
	return new Promise ((resolve, reject) => {
		fsMkdir (dir, async (err) => {
			if (err) {
				if (err.code === 'EEXIST' || dir === '') {
					resolve ([])
					return
				}

				if (err.code === 'ENOENT') {
					let createdDirs
					try {
						createdDirs = await mkdirHelper (dirname (dir))
					} catch (obj) {
						reject (obj)
						return
					}
					let createdDir
					try {
						createdDir = await mkdirHelper (dir)
					} catch ({err, dirs}) {
						createdDirs.push (...dirs)
						reject ({err, dirs: createdDirs})
						return
					}
					createdDirs.push (...createdDir)
					resolve (createdDirs)
					return
				}

				reject ({err, dirs: []})
				return
			}

			resolve ([dir])
		})
	})
}

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
