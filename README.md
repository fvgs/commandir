# commandir :open_file_folder:

[![npm](https://img.shields.io/npm/v/commandir.svg)](https://www.npmjs.com/package/commandir)
[![downloads](https://img.shields.io/npm/dt/commandir.svg)](https://www.npmjs.com/package/commandir)
![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
[![maintained](https://img.shields.io/badge/maintained-%E2%9C%94-brightgreen.svg)](https://github.com/fvgs/commandir)

> mkdir and rmdir that just work

- The functions are idempotent, so you won't get an error for trying to create a directory that already exists or trying to remove one that doesn't.
- `mkdir` creates intermediate directories so you don't have to!
- `mkdir` and `rmdir` will always tell you exactly which directories were created or deleted so your program can [clean up after itself](#cleanup-example) if it aborts later in its execution. This is made especially easy by the fact both functions share a consistent API allowing you to pass the output of one as the input to the other!

### Install
##### yarn
```
yarn add commandir
```
##### npm
```
npm install --save commandir
```

## `mkdir (dirs)`
##### Takes a single argument
The argument is either a single path given as a string or an array of such strings.

##### Returns a promise
On success, the promise resolves to an array of strings which holds the paths of all directories that were created. If no directories were created, resolves to an empty array.

On error, rejects with an object of the form `{err, dirs}`, where `err` is the error and `dirs` is an array (possibly empty) of all directories that were created before the error occurred.

The following example makes use of async/await, but `then()` and `catch()` can be used if preferred:

```javascript
const {mkdir} = require ('commandir')

async function makeSomeDirs () {
  try {
  
    /**
     * dirs will be an array of the directories which were created.
     * That means the value will be one of the following, depending
     * on which directories already existed
     * (Note: The ordering within the array is not guaranteed)
     *
     * ['just', 'just/one', 'just/one/dir'], ['just/one', 'just/one/dir'], ['just/one/dir'], []
     */
    const dirs = await mkdir ('just/one/dir')
    
    // Same as above, but takes into account all three strings
    const dirs2 = await mkdir (['this/is/first', 'this/is/second', 'something/else'])
    
  } catch ({err, dirs}) {
  
    /**
     * dirs is just like dirs above, and contains the directories which
     * were created before the error occurred
     */
     
  }
}
```

## `rmdir (dirs)`
##### Takes a single argument
The argument is either a single path given as a string or an array of such strings.

##### Returns a promise
On success, the promise resolves to an array of strings which holds the paths of all directories that were deleted. If no directories were deleted, resolves to an empty array.

On error, rejects with an object of the form `{err, dirs}`, where `err` is the error and `dirs` is an array (possibly empty) of all directories that were deleted before the error occurred.

**Note:** `rmdir` does *not* delete intermediate directories

The following example makes use of async/await, but `then()` and `catch()` can be used if preferred:

```javascript
const {rmdir} = require ('commandir')

async function deleteSomeDirs () {
  try {
  
    /**
     * dirs will either be the singleton array ['just/one/dir'] if the
     * directory was deleted, or an empty array if the directory
     * did not exist
     */
    const dirs = await rmdir ('just/one/dir')
    
    /**
     * Same as above, but takes into account all three strings.
     * Thus, dirs2 may have from 0 to 3 elements
     * (Note: The ordering within the array is not guaranteed)
     */
    const dirs2 = await rmdir (['this/is/first', 'this/is/second', 'something/else'])
    
  } catch ({err, dirs}) {
  
    /**
     * dirs is just like dirs above, and contains the directories which
     * were deleted before the error occurred
     */
     
  }
}
```

## Cleanup Example
It's not nice to litter a user's filesystem with unnecessary directories when your program crashes, fails to complete, or is aborted. Fortunately, Commandir makes it super easy for your program to clean up after itself!

For clarity, the error catching in this example has been omitted. But in almost all use cases (including this one), you should be catching errors.

```javascript
const {mkdir, rmdir} = require ('commandir')

async function cleanupExample () {
  const dirs = await mkdir ('lets/make/some/dirs')

  try {
    throw new Error ('Oops... this is an unrecoverable error')
  } catch (err) {
    // We'd better clean up those dirs instead of leaving
    // them on the user's filesystem for eternity!
    rmdir (dirs)
  }
}
```
