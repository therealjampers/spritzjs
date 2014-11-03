var test = require('tape')
	, spritz = require('../');

/*	JSON string representation of an N=256 initialized state */
var INITIAL_STATE = '{"i":0,"j":0,"k":0,"z":0,"a":0,"w":1,"S":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]}';
/*	convenience test string-to-byte-array helper, strips any high bytes just in case */
function str2byteArr(str) {
	return str.split('').map(function(c){return c.charCodeAt(0) & 0xff });
};


test('spritzjs existence', function (t) {
	spritz = require('../');
	t.ok(typeof spritz === 'object', 'spritzjs exists');
	t.end();
});

test('spritz API', function (t) {
	t.equal(typeof spritz.getState, 		"function");
	t.equal(typeof spritz.absorb, 			"function");
	t.equal(typeof spritz.absorbByte, 	"function");
	t.equal(typeof spritz.absorbNibble, "function");
	t.equal(typeof spritz.absorbStop, 	"function");
	t.equal(typeof spritz.shuffle, 			"function");
	t.equal(typeof spritz.whip, 				"function");
	t.equal(typeof spritz.crush, 				"function");
	t.equal(typeof spritz.squeeze, 			"function");
	t.equal(typeof spritz.drip, 				"function");
	t.equal(typeof spritz.update, 			"function");
	t.equal(typeof spritz.output, 			"function");
	t.end();
});

// TODO consider using a DI spy object to test what are intended to be private methods/vars
// TODO absorbByte etc. tests?
test('getState should return false before initialization', function (t) {
	t.equal(spritz.getState(), false);
	t.end();
});

test('getState should initializeState in the expected manner', function (t) {
	spritz.initializeState();
	t.deepEqual(spritz.getState(), JSON.parse(INITIAL_STATE));
	t.end();
});

test('absorb should return false with bad inputs', function (t) {
	spritz.initializeState();
	t.equal(spritz.absorb(), 			false);
	t.equal(spritz.absorb(false), false);
	t.equal(spritz.absorb({}), 		false);
	t.equal(spritz.absorb(""), 		false);
	t.equal(spritz.absorb("hi"), 	false);
	t.equal(spritz.absorb([]), 		false);
	t.end();
});

test('absorb should return true with an array of length greater than zero', function (t) {
	// should use plain arrays as anything more exotic might make it less useful or more bloated
	spritz.initializeState();
	t.equal(spritz.absorb([0, 1, 2, 3]), true);
	t.end();
});

test('absorb should mutate the state', function (t) {
	spritz.initializeState();
	t.deepEqual(spritz.getState(), JSON.parse(INITIAL_STATE));
	spritz.absorb([0, 1, 2, 3]);
	t.notDeepEqual(spritz.getState(), JSON.parse(INITIAL_STATE));
	t.end();
});


test('drip should return the expected bytes having absorbed "ABC"', function (t) {

	spritz.initializeState();
	spritz.absorb(str2byteArr("ABC"));

	t.equal(spritz.drip(), 0x77);
	t.equal(spritz.drip(), 0x9a);
	t.equal(spritz.drip(), 0x8e);
	t.equal(spritz.drip(), 0x01);
	t.equal(spritz.drip(), 0xf9);
	t.equal(spritz.drip(), 0xe9);
	t.equal(spritz.drip(), 0xcb);
	t.equal(spritz.drip(), 0xc0);
	t.end();
});

test('drip should return the expected bytes having absorbed "spam"', function (t) {

	spritz.initializeState();
	spritz.absorb(str2byteArr("spam"));

	t.equal(spritz.drip(), 0xf0);
	t.equal(spritz.drip(), 0x60);
	t.equal(spritz.drip(), 0x9a);
	t.equal(spritz.drip(), 0x1d);
	t.equal(spritz.drip(), 0xf1);
	t.equal(spritz.drip(), 0x43);
	t.equal(spritz.drip(), 0xce);
	t.equal(spritz.drip(), 0xbf);
	t.end();
});

test('drip should return the expected bytes having absorbed "arcfour"', function (t) {

	spritz.initializeState();
	spritz.absorb(str2byteArr("arcfour"));

	t.equal(spritz.drip(), 0x1a);
	t.equal(spritz.drip(), 0xfa);
	t.equal(spritz.drip(), 0x8b);
	t.equal(spritz.drip(), 0x5e);
	t.equal(spritz.drip(), 0xe3);
	t.equal(spritz.drip(), 0x37);
	t.equal(spritz.drip(), 0xdb);
	t.equal(spritz.drip(), 0xc7);
	t.end();
});

test('squeeze should return the expected leading hash bytes having absorbed message "ABC"', function (t) {

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

	t.equal(hashed[0], 0x02);
	t.equal(hashed[1], 0x8f);
	t.equal(hashed[2], 0xa2);
	t.equal(hashed[3], 0xb4);
	t.equal(hashed[4], 0x8b);
	t.equal(hashed[5], 0x93);
	t.equal(hashed[6], 0x4a);
	t.equal(hashed[7], 0x18);
	t.end();
});

test('squeeze should return the expected leading hash bytes having absorbed message "spam"', function (t) {

	var M = str2byteArr("spam")
		, r = 0x20
		, hashed
		;

	spritz.initializeState();
	spritz.absorb(M);
	spritz.absorbStop();
	spritz.absorb([r & 0xff]);
	hashed = spritz.squeeze(r);

	t.equal(hashed[0], 0xac);
	t.equal(hashed[1], 0xbb);
	t.equal(hashed[2], 0xa0);
	t.equal(hashed[3], 0x81);
	t.equal(hashed[4], 0x3f);
	t.equal(hashed[5], 0x30);
	t.equal(hashed[6], 0x0d);
	t.equal(hashed[7], 0x3a);
	t.end();
});

test('squeeze should return the expected leading hash bytes having absorbed message "arcfour"', function (t) {

	var M = str2byteArr("arcfour")
		, r = 0x20
		, hashed
		;

	spritz.initializeState();
	spritz.absorb(M);
	spritz.absorbStop();
	spritz.absorb([r & 0xff]);
	hashed = spritz.squeeze(r);

	t.equal(hashed[0], 0xff);
	t.equal(hashed[1], 0x8c);
	t.equal(hashed[2], 0xf2);
	t.equal(hashed[3], 0x68);
	t.equal(hashed[4], 0x09);
	t.equal(hashed[5], 0x4c);
	t.equal(hashed[6], 0x87);
	t.equal(hashed[7], 0xb9);
	t.end();
});

