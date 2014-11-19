# spritzjs

### A Spritz stream-cipher implementation in JavaScript

Created with reference to "Spritz - a spongy RC4-like stream cipher and hash function"
by Ronald L. Rivest and Jacob C. N. Schuldt on 2014.10.27

### Intent
Provide a literal JavaScript reference implementation from the excellent pseudo-code
created by Rivest and Schuldt; allowing the reader to follow the Paper with this code
serving as an accompaniment. To this end, variable/parameter names and their casing have
been preserved, however the function names have been camelCased for JS convention.

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
- "Security Now" podcast, episode 479 (~21 mins) - [http://twit.tv/show/security-now/479](http://twit.tv/show/security-now/479) and [shownotes](https://www.grc.com/sn/SN-479-Notes.pdf)
- "Security Now" podcast, episode 480 (~57 mins) - [http://twit.tv/show/security-now/480](http://twit.tv/show/security-now/480) and [shownotes](https://www.grc.com/sn/SN-480-Notes.pdf)
- "Schneier on Security" - [https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html](https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html)


### Installation

#### Node.js

	npm install spritzjs

	cd spritzjs

	npm install

##### Run tests

	npm test

#### Browser

	<script src="spritzjs.js"></script>

### Usage

	var spritzjs = require('spritzjs')();

or in the browser:

	var spritzjs = window.spritzjs();

then:

#### hash
	var M = [65, 66, 67];             // "ABC" as a byte array
	var r = 32;                       // 32 byte hash desired

	var hashed = spritzjs.hash(M, r); // "hashed" now contains 32 bytes of hashed "M" material

	console.log(hashed.length);       // -> 32
	console.log(hashed);              // -> [2, 143, 162,..., 71]

#### encrypt/decrypt

	var K = [115, 101, 116, 101, 99, 45, 97, 115, 116, 114, 111, 110, 111, 109, 121];
	var M = [84, 104, 97, 110, 107, 32, 121, 111, 117, 32, 102, 111, 114, 32, 100, 101, 99, 111, 100, 105, 110, 103, 32, 116, 104, 105, 115, 32, 112, 108, 97, 105, 110, 116, 101, 120, 116, 32, 97, 116, 32, 108, 101, 97, 115, 116, 44, 32, 73, 32, 104, 111, 112, 101, 32, 121, 111, 117, 32, 119, 105, 108, 108, 32, 116, 114, 121, 32, 115, 112, 114, 105, 116, 122, 106, 115, 33];

	var encrypted = spritzjs.encrypt(K, M);       // "encrypted" now contains ciphertext C

	console.log(encrypted.length === M.length);   // -> true
	console.log(encrypted);	                      // -> [27, 217, 247,..., 165]

	var decrypted = spritzjs.decrypt(K, encrypted);

	for (var i = 0; i < decrypted.length; i++) {
		if (M[i] !== decrypted[i]) throw new Error("I shouldn't be thrown");
	}

### Contributors

- Jonathan Grande (example implementations for the missing functions... coming soon)
- Devin Weaver		(suggestions for spritzjs uptake)


### Other (known) Implementations

These repositories also exist, it would be good to ensure all implementations pass
the same verified vectors and/or assertions where relevant. Read each one to judge
for yourself!

NB. @repository owner: Please raise an issue, mail me, or create a pull-request of this
README.md to remove your repository from this list if so desired:

- [https://github.com/relrod/spritz](https://github.com/relrod/spritz)
- [https://github.com/msgodf/spritz-clojure](https://github.com/msgodf/spritz-clojure)
- [https://github.com/codahale/spritz](https://github.com/codahale/spritz)
- [https://github.com/dgryski/go-spritz](https://github.com/dgryski/go-spritz)
- [https://github.com/coderslagoon/estreamJ](https://github.com/coderslagoon/estreamJ)
- [https://github.com/jedisct1/spritz](https://github.com/jedisct1/spritz)
- [https://github.com/k5okc/Spritz](https://github.com/k5okc/Spritz)
- [https://github.com/skeeto/emacs-spritz](https://github.com/skeeto/emacs-spritz)

### TODO

- <strike>Reinstate the unit-tests - spritzjs was developed in a TDD manner using [testem](https://www.npmjs.org/package/testem), [jasmine](https://www.npmjs.org/package/jasmine) and a bunch of other stuff that doesn't need to be here so the tests will be added with a lighter test-harness (probably [tape](https://www.npmjs.org/package/tape))</strike>
- <strike>Code - complete the basic API with encrypt/decrypt etc</strike>
- <strike>Usage - hashing and encrypt/decrypt example now included</strike>
- Code - add the remaining functions "aead" (and "adad")
- Threat Modeling - THREAT.md? "this cipher should not be used until pounded on by cryptanalysts" etc
- Build - [browserify](https://www.npmjs.org/package/browserify) is awesome but we want to have the smallest footprint and are not using Node.js specific functionality. Consider js(l|h)int for ensuring correctness of the clean-source version
- Modularise - <strike>stop tests and code getting monolithic. split into core and an opt-in API.</strike> We should separate cryptanalytical test-vectors from unit-tests. Ideally we could share the same verified test vector corpus amongst any implementation, regardless of language?
- Performance - measure performance before optimising, crypto-bench fork?
- Optimisation - there are quick-wins available (such as the obvious N=256 and removal of "gcd"). what about asm.js/SIMD can we use anything here?
- Minification - once hand-optimised, let the uglification begin, when tests are in good shape, we could "golf" some interesting solutions and variants, not to mention trivial pure-functional versions
- Test vectors - more test-vectors needed! The paper only provided a handful (all are implemented in test/spritzjs-tests.js)
- Cryptanalysis - should be ready to use as is, though there may be faster implementations
- uC - port to microcontrollers, specifically 8-bit ones? tessle? IoT? Arduino/AVR/PIC? Even if straight-ported implementation code is not useful depending on the target architecture, we should be able to share the accumulated test-vectors and some ideas from the imperative low-footprint variants
- Adoption - consider options for including spritzjs in other projects if the cipher is proved sound, Node.js crypto core and crypto-browserify etc.
- Peer-review - *please*

For more information you can find the latest README.md, tests and other versions at:

- [https://github.com/therealjampers/spritzjs](https://github.com/therealjampers/spritzjs)
- [https://www.npmjs.org/package/spritzjs](https://www.npmjs.org/package/spritzjs)

*- therealjampers 2014*
