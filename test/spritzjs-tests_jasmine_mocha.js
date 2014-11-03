var assert = require('assert');

var spritz = require('../spritz-cipher');

//	JSON string representation of an N=256 initialized state
const INITIAL_STATE = '{"i":0,"j":0,"k":0,"z":0,"a":0,"w":1,"S":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]}';

//	convenience test string-to-byte-array helper, strips any high bytes just in case
const str2byteArr = function (str) {
		return str.split('').map(function(c){return c.charCodeAt(0) & 0xff });
	};

describe('spritz', function () {
	it('should return an object', function () {
		assert.equal(typeof spritz, "object");
	});
	// basic existential interface tests
	it('should have the right API', function () {
		assert.equal(typeof spritz.getState, "function");
		assert.equal(typeof spritz.absorb, "function");
		assert.equal(typeof spritz.absorbByte, "function");
		assert.equal(typeof spritz.absorbNibble, "function");
		assert.equal(typeof spritz.absorbStop, "function");
		assert.equal(typeof spritz.shuffle, "function");
		assert.equal(typeof spritz.whip, "function");
		assert.equal(typeof spritz.crush, "function");
		assert.equal(typeof spritz.squeeze, "function");
		assert.equal(typeof spritz.drip, "function");
		assert.equal(typeof spritz.update, "function");
		assert.equal(typeof spritz.output, "function");
	});
});


// TODO consider using a DI spy object to test what are intended to be private methods/vars
// TODO absorbByte etc. tests?
describe('getState', function () {

	it('getState should return false before initialization', function () {
		assert.equal(spritz.getState(), false);
	});

	it('should initializeState in the expected manner', function () {
		spritz.initializeState();
		assert.deepEqual(spritz.getState(), JSON.parse(INITIAL_STATE));
	});
});

describe('absorb', function () {

	it('absorb should return false with bad inputs', function () {
		spritz.initializeState();
		assert.equal(spritz.absorb(), false);
		assert.equal(spritz.absorb(false), false);
		assert.equal(spritz.absorb({}), false);
		assert.equal(spritz.absorb(""), false);
		assert.equal(spritz.absorb("hi"), false);
		assert.equal(spritz.absorb([]), false);
	});
	// should use plain arrays as anything more exotic might make it less useful or more bloated
	it('absorb should return true with an array of length greater than zero', function () {
		spritz.initializeState();
		assert.equal(spritz.absorb([0, 1, 2, 3]), true);
	});

	it('absorb should mutate the state', function () {
		spritz.initializeState();
		assert.deepEqual(spritz.getState(), JSON.parse(INITIAL_STATE));
		spritz.absorb([0, 1, 2, 3]);
		assert.notDeepEqual(spritz.getState(), JSON.parse(INITIAL_STATE));
	});
});

describe('raw drip output', function () {
	it('should return the expected bytes having absorbed "ABC"', function () {

		spritz.initializeState();
		spritz.absorb(str2byteArr("ABC"));

		assert.equal(spritz.drip(), 0x77);
		assert.equal(spritz.drip(), 0x9a);
		assert.equal(spritz.drip(), 0x8e);
		assert.equal(spritz.drip(), 0x01);
		assert.equal(spritz.drip(), 0xf9);
		assert.equal(spritz.drip(), 0xe9);
		assert.equal(spritz.drip(), 0xcb);
		assert.equal(spritz.drip(), 0xc0);
	});

	it('should return the expected bytes having absorbed "spam"', function () {

		spritz.initializeState();
		spritz.absorb(str2byteArr("spam"));

		assert.equal(spritz.drip(), 0xf0);
		assert.equal(spritz.drip(), 0x60);
		assert.equal(spritz.drip(), 0x9a);
		assert.equal(spritz.drip(), 0x1d);
		assert.equal(spritz.drip(), 0xf1);
		assert.equal(spritz.drip(), 0x43);
		assert.equal(spritz.drip(), 0xce);
		assert.equal(spritz.drip(), 0xbf);
	});

	it('should return the expected bytes having absorbed "arcfour"', function () {

		spritz.initializeState();
		spritz.absorb(str2byteArr("arcfour"));

		assert.equal(spritz.drip(), 0x1a);
		assert.equal(spritz.drip(), 0xfa);
		assert.equal(spritz.drip(), 0x8b);
		assert.equal(spritz.drip(), 0x5e);
		assert.equal(spritz.drip(), 0xe3);
		assert.equal(spritz.drip(), 0x37);
		assert.equal(spritz.drip(), 0xdb);
		assert.equal(spritz.drip(), 0xc7);
	});
});


/*

2.3 Hash function
The following procedure Hash produces an r-byte
hash of the input message (byte sequence) M.

	Hash(M, r )
	1 InitializeState()
	2 Absorb(M); AbsorbStop()
	3 Absorb(r)
	4 return Squeeze(r )

*/

describe('raw hash output', function () {
	it('should return the expected leading hash bytes having absorbed message "ABC"', function () {

		var M = str2byteArr("ABC")
			, r = 0x20 // 32-byte hash required
			, hashed
			;

		spritz.initializeState();
		spritz.absorb(M);
		spritz.absorbStop();
		// NB. r is passed as an array, as absorb is not currently overloaded
		spritz.absorb([r & 0xff]);
		hashed = spritz.squeeze(r);

		assert.equal(hashed[0], 0x02);
		assert.equal(hashed[1], 0x8f);
		assert.equal(hashed[2], 0xa2);
		assert.equal(hashed[3], 0xb4);
		assert.equal(hashed[4], 0x8b);
		assert.equal(hashed[5], 0x93);
		assert.equal(hashed[6], 0x4a);
		assert.equal(hashed[7], 0x18);
	});

	it('should return the expected leading hash bytes having absorbed message "spam"', function () {

		var M = str2byteArr("spam")
			, r = 0x20
			, hashed
			;

		spritz.initializeState();
		spritz.absorb(M);
		spritz.absorbStop();
		spritz.absorb([r & 0xff]);
		hashed = spritz.squeeze(r);

		assert.equal(hashed[0], 0xac);
		assert.equal(hashed[1], 0xbb);
		assert.equal(hashed[2], 0xa0);
		assert.equal(hashed[3], 0x81);
		assert.equal(hashed[4], 0x3f);
		assert.equal(hashed[5], 0x30);
		assert.equal(hashed[6], 0x0d);
		assert.equal(hashed[7], 0x3a);
	});

	it('should return the expected leading hash bytes having absorbed message "arcfour"', function () {

		var M = str2byteArr("arcfour")
			, r = 0x20
			, hashed
			;

		spritz.initializeState();
		spritz.absorb(M);
		spritz.absorbStop();
		spritz.absorb([r & 0xff]);
		hashed = spritz.squeeze(r);

		assert.equal(hashed[0], 0xff);
		assert.equal(hashed[1], 0x8c);
		assert.equal(hashed[2], 0xf2);
		assert.equal(hashed[3], 0x68);
		assert.equal(hashed[4], 0x09);
		assert.equal(hashed[5], 0x4c);
		assert.equal(hashed[6], 0x87);
		assert.equal(hashed[7], 0xb9);
	});
});
