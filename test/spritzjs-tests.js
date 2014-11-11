var test = require('tape')
  //  We'll construct spritzjs without a facade
  , spritzjs = require('../')()
  ;

/*  JSON string representation of an N=256 initialized state */
var INITIAL_STATE = '{"i":0,"j":0,"k":0,"z":0,"a":0,"w":1,"S":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]}';

/*
  convenience string-to-byte-array helper, strips any high bytes just in case
  only intended for test usage
  eg. str2byteArr("ABC"); //  -> [65, 66, 67]
*/
function str2byteArr(str) {
  return str.split('').map(function(c){return c.charCodeAt(0) & 0xff});
};


test('spritzjs existence', function (t) {
  t.ok(typeof spritzjs === 'object', 'spritzjs exists');
  t.end();
});

test('spritzjs API', function (t) {
  t.equal(typeof spritzjs.getState,       "function");
  t.equal(typeof spritzjs.absorb,         "function");
  t.equal(typeof spritzjs.absorbByte,     "function");
  t.equal(typeof spritzjs.absorbNibble,   "function");
  t.equal(typeof spritzjs.absorbStop,     "function");
  t.equal(typeof spritzjs.shuffle,        "function");
  t.equal(typeof spritzjs.whip,           "function");
  t.equal(typeof spritzjs.crush,          "function");
  t.equal(typeof spritzjs.squeeze,        "function");
  t.equal(typeof spritzjs.drip,           "function");
  t.equal(typeof spritzjs.update,         "function");
  t.equal(typeof spritzjs.output,         "function");
  t.equal(typeof spritzjs.hash,           "function");
  t.equal(typeof spritzjs.keySetup,       "function");
  t.equal(typeof spritzjs.encrypt,        "function");
  t.equal(typeof spritzjs.decrypt,        "function");
  t.equal(typeof spritzjs.encryptWithIV,  "function");
  t.equal(typeof spritzjs.decryptWithIV,  "function");
  t.end();
});

// TODO consider using a DI spy object to test what are intended to be private methods/vars
// TODO hand-worked absorbByte etc. tests?
test('getState should return false before initialization', function (t) {
  t.equal(spritzjs.getState(), false);
  t.end();
});

test('getState should initializeState in the expected manner', function (t) {
  spritzjs.initializeState();
  t.deepEqual(spritzjs.getState(), JSON.parse(INITIAL_STATE));
  t.end();
});

test('absorb should return false with bad inputs', function (t) {
  spritzjs.initializeState();
  t.equal(spritzjs.absorb(),      false);
  t.equal(spritzjs.absorb(false), false);
  t.equal(spritzjs.absorb({}),    false);
  t.equal(spritzjs.absorb(""),    false);
  t.equal(spritzjs.absorb("hi"),  false);
  t.equal(spritzjs.absorb([]),    false);
  t.end();
});

test('absorb should return true with an array of length greater than zero', function (t) {
  spritzjs.initializeState();
  // we elect to use plain arrays as anything more exotic might make it less portable
  t.equal(spritzjs.absorb([1]), true);
  t.end();
});

test('absorb should mutate the state having absorbed a sensible byte array', function (t) {
  spritzjs.initializeState();
  t.deepEqual(spritzjs.getState(), JSON.parse(INITIAL_STATE));

  spritzjs.absorb([0, 1, 2, 3]);

  t.notDeepEqual(spritzjs.getState(), JSON.parse(INITIAL_STATE));
  t.end();
});

test('drip should return the expected bytes having absorbed "ABC"', function (t) {

  spritzjs.initializeState();
  spritzjs.absorb(str2byteArr("ABC"));

  t.equal(spritzjs.drip(), 0x77);
  t.equal(spritzjs.drip(), 0x9a);
  t.equal(spritzjs.drip(), 0x8e);
  t.equal(spritzjs.drip(), 0x01);
  t.equal(spritzjs.drip(), 0xf9);
  t.equal(spritzjs.drip(), 0xe9);
  t.equal(spritzjs.drip(), 0xcb);
  t.equal(spritzjs.drip(), 0xc0);
  t.end();
});

test('drip should return the expected bytes having absorbed "spam"', function (t) {

  spritzjs.initializeState();
  spritzjs.absorb(str2byteArr("spam"));

  t.equal(spritzjs.drip(), 0xf0);
  t.equal(spritzjs.drip(), 0x60);
  t.equal(spritzjs.drip(), 0x9a);
  t.equal(spritzjs.drip(), 0x1d);
  t.equal(spritzjs.drip(), 0xf1);
  t.equal(spritzjs.drip(), 0x43);
  t.equal(spritzjs.drip(), 0xce);
  t.equal(spritzjs.drip(), 0xbf);
  t.end();
});

test('drip should return the expected bytes having absorbed "arcfour"', function (t) {

  spritzjs.initializeState();
  spritzjs.absorb(str2byteArr("arcfour"));

  t.equal(spritzjs.drip(), 0x1a);
  t.equal(spritzjs.drip(), 0xfa);
  t.equal(spritzjs.drip(), 0x8b);
  t.equal(spritzjs.drip(), 0x5e);
  t.equal(spritzjs.drip(), 0xe3);
  t.equal(spritzjs.drip(), 0x37);
  t.equal(spritzjs.drip(), 0xdb);
  t.equal(spritzjs.drip(), 0xc7);
  t.end();
});

test('squeeze should return the expected leading hash bytes having absorbed message "ABC"', function (t) {

  var M = str2byteArr("ABC")
    , r = 0x20 // 32-byte hash desired
    , hashed
    ;

  spritzjs.initializeState();
  spritzjs.absorb(M);
  spritzjs.absorbStop();
  // NB. r is passed as an array, as absorb is not currently overloaded
  spritzjs.absorb([r & 0xff]);
  hashed = spritzjs.squeeze(r);

  t.equal(hashed.length, r);

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

  spritzjs.initializeState();
  spritzjs.absorb(M);
  spritzjs.absorbStop();
  spritzjs.absorb([r & 0xff]);
  hashed = spritzjs.squeeze(r);

  t.equal(hashed.length, r);

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

  spritzjs.initializeState();
  spritzjs.absorb(M);
  spritzjs.absorbStop();
  spritzjs.absorb([r & 0xff]);
  hashed = spritzjs.squeeze(r);

  t.equal(hashed.length, r);

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

test('hash should return the same result as the initializeState/absorb/absorbStop/squeeze steps with "ABC"', function (t) {

  var M = str2byteArr("ABC")
    , r = 0x20
    , hashed
    ;

  hashed = spritzjs.hash(M, r);

  t.equal(hashed.length, r);

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

test('keySetup should disallow invalid arguments', function (t) {

  t.equal(spritzjs.keySetup(),          false);       // arity 0
  t.equal(spritzjs.keySetup([], []),    false);       // arity 2
  t.equal(spritzjs.keySetup([], 1, 1),  false);       // arity 3

  t.equal(spritzjs.keySetup([]),        false);       // K array too short
  // TODO consider enforcing 1 < K.length <= N / 4
  t.end();
});

test('keySetup should allow valid K byte arrays', function (t) {
  t.equal(spritzjs.keySetup([65, 66, 67]),        true);
  t.end();
});

test('keySetup should produce the same internal state as the core primitive steps', function (t) {

  var K = [65, 66, 67];

  spritzjs.initializeState();
  spritzjs.absorb(K);
  var primitiveState = spritzjs.getState();

  spritzjs.keySetup(K);
  var keySetupState = spritzjs.getState();

  t.deepEqual(primitiveState, keySetupState);
  t.end();
});

test('encrypt should return a ciphertext C of the same length as M', function (t) {
  var K = [65, 66, 67]
    , M = [68, 69, 70]
    , C
    ;

  C = spritzjs.encrypt(K, M);

  t.equal(M.length, C.length);
  t.end();
});

test('encrypt should not return the same message that went in', function (t) {
  var K = [65, 66, 67]
    , M = [68, 69, 70]
    , C
    ;

  C = spritzjs.encrypt(K, M);

  t.notDeepEqual(M, C);
  t.end();
});

test('decrypt should return a plaintext M of the same length as C', function (t) {
  var K = [65, 66, 67]
    , C = [68, 69, 70]
    , M
    ;

  M = spritzjs.decrypt(K, C);

  t.equal(C.length, M.length);
  t.end();
});

test('decrypt should not return the same ciphertext that went in', function (t) {
  var K = [65, 66, 67]
    , C = [68, 69, 70]
    , M
    ;

  M = spritzjs.decrypt(K, C);

  t.notDeepEqual(C, M);
  t.end();
});

test('decrypt(K, encrypt(K, M)) should equal the original M', function (t) {
  var K = [65, 66, 67]
    , M = [68, 69, 70]
    ;

  t.deepEqual(spritzjs.decrypt(K, spritzjs.encrypt(K, M)), M);
  // QED
  t.end();
});

test('decrypt(K1, encrypt(K2, M)) should not equal the original M', function (t) {
  var K1 =  [65, 66, 67]
    , K2 =  [100, 101, 102]
    , M =   [68, 69, 70]
    ;

  t.notDeepEqual(spritzjs.decrypt(K1, spritzjs.encrypt(K2, M)), M);
  t.end();
});

test('encryptWithIV should return a ciphertext C of the same length as M', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , M =   [68, 69, 70]
    , C
    ;

  C = spritzjs.encryptWithIV(K, IV, M);

  t.equal(M.length, C.length);
  t.end();
});

test('encryptWithIV should not return the same message that went in', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , M =   [68, 69, 70]
    , C
    ;

  C = spritzjs.encryptWithIV(K, IV, M);

  t.notDeepEqual(M, C);
  t.end();
});

test('encryptWithIV should not return the same ciphertext as encrypt (without IV)', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , M =   [68, 69, 70]
    , C1
    , C2
    ;

  C1 = spritzjs.encryptWithIV(K, IV, M);
  C2 = spritzjs.encrypt(K, M);

  t.notDeepEqual(C1, C2);
  t.end();
});

test('decryptWithIV should return a plaintext M of the same length as C', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , C =   [68, 69, 70]
    , M
    ;

  M = spritzjs.decryptWithIV(K, IV, C);

  t.equal(M.length, C.length);
  t.end();
});

test('decryptWithIV should not return the same ciphertext that went in', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , C =   [68, 69, 70]
    , M
    ;

  M = spritzjs.decryptWithIV(K, IV, C);

  t.notDeepEqual(M, C);
  t.end();
});

test('decryptWithIV(K, IV, encryptWithIV(K, IV, M)) should equal the original M', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , M =   [68, 69, 70]
    ;

  t.deepEqual(spritzjs.decryptWithIV(K, IV, spritzjs.encryptWithIV(K, IV, M)), M);
  t.end();
});

test('decryptWithIV(K, IV, encrypt(K, M)) should not equal the original M', function (t) {
  var K =   [65, 66, 67]
    , IV =  [1, 2, 3]
    , M =   [68, 69, 70]
    ;

  t.notDeepEqual(spritzjs.decryptWithIV(K, IV, spritzjs.encrypt(K, M)), M);
  t.end();
});
