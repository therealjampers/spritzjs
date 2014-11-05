# spritzjs

### A Spritz stream-cipher implementation in JavaScript

Created with reference to "Spritz - a spongy RC4-like stream cipher and hash function"
by Ronald L. Rivest and Jacob C. N. Schuldt on 2014.10.27

### Intent
Provide a literal JavaScript reference implementation from the excellent pseudo-code
created by Rivest and Schuldt; allowing the reader to follow the Paper with this code
serving as an accompaniment. To this end, variable/parameter names and their casing have
been preserved, however the function names have been camel-cased for JS convention.

It is hoped this may serve as a starting point for those who wish to explore this cipher
in a JS context.

The main source file (spritzjs.js) is deliberately unoptimized with the aim of readability,
yet is *relatively* portable. (For example, "isArray" support is assumed rather than feature-detected, and may need replacing if you wish to run this on IE8- or *very* old
Firefox versions.
See: [http://kangax.github.io/compat-table/es5/#Array.isArray](http://kangax.github.io/compat-table/es5/#Array.isArray))

Tested in: Node.js (0.10.26+), Chrome (38+), Firefox (33+)

##### References:

- "Spritz - a spongy RC4-like stream cipher and hash function"
 by Rivest and Schuldt - [http://people.csail.mit.edu/rivest/pubs/RS14.pdf](http://people.csail.mit.edu/rivest/pubs/RS14.pdf)
- "Security Now" podcast, episode 479 - [http://twit.tv/show/security-now/479](http://twit.tv/show/security-now/479) and [shownotes](https://www.grc.com/sn/SN-479-Notes.pdf)
- "Security Now" podcast, episode 480 - [http://twit.tv/show/security-now/480](http://twit.tv/show/security-now/480) and [shownotes](https://www.grc.com/sn/SN-480-Notes.pdf)
- "Schneier on Security" - [https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html](https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html)


### Installation

#### Node.js

	npm install spritzjs

	npm install

##### Run tests

	npm test

#### Browser

	<script src="spritzjs.js"></script>

### Usage

	var spritzjs = require('spritzjs');

or in the browser (though not strictly needed):

	var spritzjs = window.spritzjs;

then:

	var M = [65, 66, 67];             // "ABC" as a byte array

	var r = 32;                       // 32 byte hash desired

	var hashed = spritzjs.hash(M, r); // "hashed" now contains 32 bytes of hashed "M" material

	console.log(hashed.length);       // -> 32


### TODO

- <strike>Reinstate the unit-tests - spritzjs was developed in a TDD manner using [testem](https://www.npmjs.org/package/testem), [jasmine](https://www.npmjs.org/package/jasmine) and a bunch of other stuff that doesn't need to be here so the tests will be added with a lighter test-harness (probably [tape](https://www.npmjs.org/package/tape))</strike>
- Code - Complete the API with encrypt/decrypt etc
- Usage - how to use it. NB. perfunctory hashing example now included
- Threat Modelling - THREAT.md? "this cipher should not be used until pounded on by cryptanalysts" etc
- Build - [browserify](https://www.npmjs.org/package/browserify) is awesome but we want to have the smallest footprint and are not using Node.js specific functionality. Consider js(l|h)int for ensuring correctness of the clean-source version
- Performance - measure performance before optimising
- Optimisation - there are quick-wins available. Also, what about asm.js/SIMD can we use anything here?
- Minification - once hand-optimised, let the uglification begin. Also, size-wise when the tests permit, we could "golf" some interesting solutions
- Test vectors - More test-vectors would be appreciated! The paper only provided a handful (all are implemented in test/spritzjs-tests.js)
- Cryptanalysis - should be ready to use as is, though there may be faster implementations
- uC - port to microcontrollers, specifically 8-bit ones? tessle? IoT? Arduino/AVR/PIC? Even if ported implementation code is not useful depending on the target architecture, we should be able to share the accumulated (verified) test-vectors

For more information you can find the latest README.md, tests and other versions at:

- [https://github.com/therealjampers/spritzjs](https://github.com/therealjampers/spritzjs)
- [https://www.npmjs.org/package/spritzjs](https://www.npmjs.org/package/spritzjs)

*- therealjampers 2014*
