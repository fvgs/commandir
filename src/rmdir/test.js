const {join} = require ('path')
const rmdir = require ('./index')
const {invalidNumberOfArguments, invalidArgumentType} = require ('../strings')
const {
	setup,
	teardown,
	testMkdir,
	testRmdir,
	getPrefixes,
	dirExists,
} = require ('../utils')

// Directories to use in tests. These will be created before each test
const testDirs = ['giant', 'foam', 'panda', '1']

beforeAll (setup)
afterAll (async () => {
	const prefixes = getPrefixes (testDirs) . reverse ()
	for (const prefix of prefixes) await testRmdir (prefix)
	await Promise.all (testDirs.map (testRmdir))
	await teardown ()
})

beforeEach (async () => {
	const prefixes = getPrefixes (testDirs)
	for (const prefix of prefixes) await testMkdir (prefix)
	await Promise.all (testDirs.map (testMkdir))
})

test ('Reject given incorrect number of arguments', async () => {
	const tests = [[], testDirs.slice (0, 2), testDirs.slice (0, 3)]
	const assertions = [
		({err: {message}}) => expect (message) . toBe (invalidNumberOfArguments),
		({dirs}) => expect (dirs) . toEqual ([]),
	]

	expect.assertions (tests.length * assertions.length)

	const results = tests.map (async (args) => {
		try {
			await rmdir (...args)
		} catch (obj) {
			assertions.forEach ((assertion) => assertion (obj))
		}
	})
	await Promise.all (results)
})

test ('Reject given argument of invalid type', async () => {
	let tests = [true, false, 0, 1, NaN, null, undefined, {}, {a: 0}, Symbol ()]
	tests = tests.map ((t) => [t, [t], [testDirs[0], t], [t, testDirs[0]]])
	tests = [].concat (...tests)
	const assertions = [
		({err: {message}}) => expect (message) . toBe (invalidArgumentType),
		({dirs}) => expect (dirs) . toEqual ([]),
	]

	expect.assertions (tests.length * assertions.length)

	const results = tests.map (async (args) => {
		try {
			await rmdir (args)
		} catch (obj) {
			assertions.forEach ((assertion) => assertion (obj))
		}
	})
	await Promise.all (results)
})

test ('Delete single directory given string', async () => {
	const results = testDirs.slice (1) . map (async (dir) => {
		let result = await rmdir (dir)
		expect (result) . toEqual ([dir])
		let exists = await dirExists (dir)
		expect (exists) . toBe (false)
		result = await rmdir (dir)
		expect (result) . toEqual ([])
		exists = await dirExists (dir)
		expect (exists) . toBe (false)
	})
	await Promise.all (results)
})

test ('Delete directories given array', async () => {
	let dirs = [...testDirs, join (...testDirs), ...getPrefixes (testDirs)]
	let result = await rmdir (dirs)
	dirs = [...new Set (dirs)]
	expect (result.sort ()) . toEqual (dirs.sort ())
	let exist = await Promise.all (dirs.map (dirExists))
	expect (exist.every ((b) => !b)) . toBe (true)
	result = await rmdir (dirs)
	expect (result) . toEqual ([])
	exist = await Promise.all (dirs.map (dirExists))
	expect (exist.every ((b) => !b)) . toBe (true)
})
