const {join} = require ('path')
const mkdir = require ('./index')
const {invalidNumberOfArguments, invalidArgumentType} = require ('../strings')
const {
	setup,
	teardown,
	testRmdir,
	getPrefixes,
	dirExists,
} = require ('../utils')

// Directories to use in tests. These will be cleaned up after each test
const testDirs = ['giant', 'foam', 'panda', '1']

beforeAll (setup)
afterAll (teardown)

afterEach (async () => {
	const prefixes = getPrefixes (testDirs) . reverse ()
	for (const prefix of prefixes) await testRmdir (prefix)
	await Promise.all (testDirs.map (testRmdir))
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
			await mkdir (...args)
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
			await mkdir (args)
		} catch (obj) {
			assertions.forEach ((assertion) => assertion (obj))
		}
	})
	await Promise.all (results)
})

test ('Create single directory given string', async () => {
	const results = testDirs.map (async (dir) => {
		let result = await mkdir (dir)
		expect (result) . toEqual ([dir])
		let exists = await dirExists (dir)
		expect (exists) . toBe (true)
		result = await mkdir (dir)
		expect (result) . toEqual ([])
		exists = await dirExists (dir)
		expect (exists) . toBe (true)
	})
	await Promise.all (results)
})

test ('Create intermediate directories given string', async () => {
	const dir = join (...testDirs)
	let result = await mkdir (dir)
	const prefixes = getPrefixes (testDirs)
	expect (result) . toEqual (prefixes)
	let exist = await Promise.all (prefixes.map (dirExists))
	expect (exist.every ((b) => b)) . toBe (true)
	result = await mkdir (dir)
	expect (result) . toEqual ([])
	exist = await Promise.all (prefixes.map (dirExists))
	expect (exist.every ((b) => b)) . toBe (true)
})

test ('Create directories given array', async () => {
	let dirs = [...testDirs, join (...testDirs), ...getPrefixes (testDirs)]
	let result = await mkdir (dirs)
	dirs = [...new Set (dirs)]
	expect (result.sort ()) . toEqual (dirs.sort ())
	let exist = await Promise.all (dirs.map (dirExists))
	expect (exist.every ((b) => b)) . toBe (true)
	result = await mkdir (dirs)
	expect (result) . toEqual ([])
	exist = await Promise.all (dirs.map (dirExists))
	expect (exist.every ((b) => b)) . toBe (true)
})
