const {mkdir: fsMkdir} = require ('fs')
const {dirname} = require ('path')
const {isString, isArray} = require ('../utils')
const {invalidNumberOfArguments, invalidArgumentType} = require ('../strings')

module.exports = mkdir

async function mkdir (...args) {
	if (args.length !== 1) {
		const err = new Error (invalidNumberOfArguments)
		throw {err, dirs: []}
	}

	const [dirs] = args

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

	const err = new Error (invalidArgumentType)
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
