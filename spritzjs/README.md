# spritzjs - v0.0.1


### A Spritz stream-cipher implementation in JavaScript


Created with reference to "Spritz - a spongy RC4-like stream cipher and hash function"
by Ronald L. Rivest and Jacob C. N. Schuldt on 2014.10.27 - [http://people.csail.mit.edu/rivest/pubs/RS14.pdf](http://people.csail.mit.edu/rivest/pubs/RS14.pdf)

### Intent
Provide a literal JavaScript reference implementation from the pseudo-code provided by Rivest and Schuldt;
allowing the reader to follow the Paper with this code serving as an accompaniment. To this end, variable/parameter names and their
casing have been preserved, however the function names have been camel-cased for JS convention.

It is hoped this may serve as a starting point for those who wish to explore this cipher in a JS context.

This source file is deliberately unoptimized with the aim of readability, yet is *relatively* portable. (For example,
"isArray" support is assumed rather than feature-detected, and may need replacing
if you wish to run this on IE8-, or very old Firefox versions.
See: [http://kangax.github.io/compat-table/es5/#Array.isArray](http://kangax.github.io/compat-table/es5/#Array.isArray))

Tested in: Node.js (0.10.26+), Chrome (38+), Firefox (33+)

##### Inspiration:

- "Security Now" podcast, episode 479 - [http://twit.tv/show/security-now/479](http://twit.tv/show/security-now/479)
- "Schneier on Security" - [https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html](https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html)

### TODO

- Reinstate the unit-tests - spritzjs was developed in a TDD manner using testem/jasmine and a bunch of other stuff that doesn't need to be here so the tests will be added with a lighter test-harness (probably [tape](https://www.npmjs.org/package/tape))

- Code - Complete the API with encrypt/decrypt/hash etc
- Build - browserify is nice but we want to have the smallest footprint and are not using Node.js specific functionality
- Minification - once hand-optimised, let the Uglification begin
- Performance - measure performance before optimising
- Optimisation - there are lots of quick-wins. Also, size-wise when the tests permit, we could "golf" some interesting solutions
- Test vectors - More test-vectors would be appreciated! The paper only provided a handful.
- Cryptanalysis - should be ready to use as is, though there may be faster implementations
- asm.js/SIMD - can we make an implementation approaching the fastest possible?
- uC - port to microcontrollers, 8-bit ones? tessle? IoT? Arduino/AVR/PIC? Even if the code is not useful, we should be able to share the accumulated and verified test-vectors!

For more information you can find the latest README.md, tests and minified versions at:

[https://github.com/therealjampers/spritzjs](https://github.com/therealjampers/spritzjs)


*therealjampers - 2014.11.03*