# object-convert [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

Convert an object from one schema to another.

## Installation

```sh
$ npm install --save object-convert
```

## Usage

```js
var converter = require('object-convert'),
	type = converter.type;

converter().define({
	user: {
		fullName: type(String, 'name'),
		bornOn: type(Date, 'birthDate'),
		likesCats: type(Boolean, 'interestingFacts.likesDogs'),
		hasPets: type(Boolean, 'interestingFacts.petNames', function(value) {
			return !!value.length;
		})
	}
}).convert({
	name: 'Matthew Slipper',
	birthDate: new Date(),
	interestingFacts: {
		likesDogs: true,
		petNames: [ 'Speedy' ]
	}
});

/**
Would return:

{
	user: {
		fullName: 'Matthew Slipper',
		bornOn: Date,
		likesCats: false,
		hasPets: true
	}
}
**/

```
## License

MIT © [Matthew Slipper](matthewslipper.com)


[npm-image]: https://badge.fury.io/js/object-convert.svg
[npm-url]: https://npmjs.org/package/object-convert
[travis-image]: https://travis-ci.org/mslipper/object-convert.svg?branch=master
[travis-url]: https://travis-ci.org/mslipper/object-convert
[daviddm-image]: https://david-dm.org/mslipper/object-convert.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mslipper/object-convert
