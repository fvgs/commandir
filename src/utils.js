module.exports = {isString, isArray}

function isString (val) {
	return Object.prototype.toString.call (val) === '[object String]'
}

function isArray (val) {
	return Object.prototype.toString.call (val) === '[object Array]'
}
