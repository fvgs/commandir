const {access, mkdir, rmdir} = require ('fs')
const {dirname, join} = require ('path')

const {chdir, cwd} = process
// Temporary directory to use for testing
const testingDir = '__TESTING__DIRECTORY__'

module.exports = {
	isString,
	isArray,
	setup,
	teardown,
	testMkdir,
	testRmdir,
	getPrefixes,
	dirExists,
}

function isString (val) {
	return Object.prototype.toString.call (val) === '[object String]'
}

function isArray (val) {
	return Object.prototype.toString.call (val) === '[object Array]'
}

async function setup () {
	await new Promise ((resolve, reject) => {
		mkdir (testingDir, (err) => {
			if (err) {
				reject (err)
				return
			}
			resolve ()
		})
	})
	chdir (testingDir)
}

async function teardown () {
	chdir (dirname (cwd ()))
	await new Promise ((resolve, reject) => {
		rmdir (testingDir, (err) => {
			if (err) {
				reject (err)
				return
			}
			resolve ()
		})
	})
}

async function testMkdir (dir) {
	return new Promise ((resolve, reject) => {
		mkdir (dir, (err) => {
			if (err && err.code !== 'EEXIST') {
				reject (err)
				return
			}
			resolve ()
		})
	})
}

async function testRmdir (dir) {
	return new Promise ((resolve, reject) => {
		rmdir (dir, (err) => {
			if (err && err.code !== 'ENOENT') {
				reject (err)
				return
			}
			resolve ()
		})
	})
}

function getPrefixes (dirs) {
	const [prefixes] = dirs.reduce (([prefixes, last], dir) => {
		const prefix = join (last, dir)
		prefixes.push (prefix)
		return [prefixes, prefix]
	}, [[], ''])
	return prefixes
}

async function dirExists (dir) {
	return new Promise ((resolve, reject) => {
		access (dir, (err) => resolve (!err))
	})
}
