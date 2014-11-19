var test =            require('tape')
  , facadeHighLevel = require('../facade-high-level')
  , spritzjs =        require('../spritzjs')(facadeHighLevel)
  ;

test('facaded spritzjs existence', function (t) {
  t.ok(typeof spritzjs === 'object', 'spritzjs exists');
  t.end();
});

test('spritzjs API', function (t) {
  t.equal(typeof spritzjs.hash,           "function");
  t.equal(typeof spritzjs.encrypt,        "function");
  t.equal(typeof spritzjs.decrypt,        "function");
  t.equal(typeof spritzjs.encryptWithIV,  "function");
  t.equal(typeof spritzjs.decryptWithIV,  "function");
  t.equal(typeof spritzjs.domHash,        "function");
  t.end();
});

test('nothing from the core should be exposed', function (t) {
  t.equal(typeof hash,                    'undefined');
  t.equal(typeof keySetup,                'undefined');
  t.equal(typeof initializeState,         'undefined');
  t.equal(typeof absorb,                  'undefined');
  t.equal(typeof absorbByte,              'undefined');
  t.equal(typeof absorbNibble,            'undefined');
  t.equal(typeof absorbStop,              'undefined');
  t.equal(typeof shuffle,                 'undefined');
  t.equal(typeof whip,                    'undefined');
  t.equal(typeof crush,                   'undefined');
  t.equal(typeof squeeze,                 'undefined');
  t.equal(typeof drip,                    'undefined');
  t.equal(typeof update,                  'undefined');
  t.equal(typeof output,                  'undefined');
  t.equal(typeof getState,                'undefined');
  t.end();
});

test('spritzjs.hash should disallow invalid arguments (like the old tests used to)', function (t) {

  t.equal(spritzjs.hash(),          false);       // arity 0
  t.equal(spritzjs.hash([]),        false);       // arity 1
  t.equal(spritzjs.hash([], 1, 1),  false);       // arity 3

  t.equal(spritzjs.hash([],   1),   false);       // M array too short
  t.equal(spritzjs.hash([1], ""),   false);       // invalid r
  t.equal(spritzjs.hash([1],  0),   false);       // invalid r

  t.end();
});

test('encrypt should disallow invalid arguments', function (t) {

  t.equal(spritzjs.encrypt(),          false);       // arity 0
  t.equal(spritzjs.encrypt([]),        false);       // arity 1
  t.equal(spritzjs.encrypt([], 1, 1),  false);       // arity 3

  t.equal(spritzjs.encrypt([],   1),   false);       // K array too short
  t.equal(spritzjs.encrypt([1], ""),   false);       // invalid M
  t.equal(spritzjs.encrypt([1],  []),  false);       // invalid M
  t.end();
});

test('decrypt should disallow invalid arguments', function (t) {

  t.equal(spritzjs.decrypt(),          false);       // arity 0
  t.equal(spritzjs.decrypt([]),        false);       // arity 1
  t.equal(spritzjs.decrypt([], 1, 1),  false);       // arity 3

  t.equal(spritzjs.decrypt([],   1),   false);       // K array too short
  t.equal(spritzjs.decrypt([1], ""),   false);       // invalid C
  t.equal(spritzjs.decrypt([1],  []),  false);       // invalid C
  t.end();
});

test('encryptWithIV should disallow invalid arguments', function (t) {

  // now here's a justification for TypeScript
  t.equal(spritzjs.encryptWithIV(),                 false);       // arity 0
  t.equal(spritzjs.encryptWithIV([]),               false);       // arity 1
  t.equal(spritzjs.encryptWithIV([], 1),            false);       // arity 2
  t.equal(spritzjs.encryptWithIV([], 1, 1, 1),      false);       // arity 4

  t.equal(spritzjs.encryptWithIV([],   1),          false);       // K array too short

  t.equal(spritzjs.encryptWithIV([1], ""),          false);       // invalid IV
  t.equal(spritzjs.encryptWithIV([1],  []),         false);       // invalid IV

  t.equal(spritzjs.encryptWithIV([1],  [1], ""),    false);       // invalid M
  t.equal(spritzjs.encryptWithIV([1],  [1], []),    false);       // invalid M

  t.end();
});

test('decryptWithIV should disallow invalid arguments', function (t) {

  t.equal(spritzjs.decryptWithIV(),                 false);       // arity 0
  t.equal(spritzjs.decryptWithIV([]),               false);       // arity 1
  t.equal(spritzjs.decryptWithIV([], 1),            false);       // arity 2
  t.equal(spritzjs.decryptWithIV([], 1, 1, 1),      false);       // arity 4

  t.equal(spritzjs.decryptWithIV([],   1),          false);       // K array too short

  t.equal(spritzjs.decryptWithIV([1], ""),          false);       // invalid IV
  t.equal(spritzjs.decryptWithIV([1],  []),         false);       // invalid IV

  t.equal(spritzjs.decryptWithIV([1],  [1], ""),    false);       // invalid C
  t.equal(spritzjs.decryptWithIV([1],  [1], []),    false);       // invalid C
  t.end();
});

/* sanity check, is actually a test-vector */
test('hash should return test-vector result for "ABC"', function (t) {

  var M = [65, 66, 67]    //  "ABC"
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

test('domHash should disallow invalid arguments', function (t) {

  // now here's a justification for TypeScript
  t.equal(spritzjs.domHash(),                 false);       // arity 0
  t.equal(spritzjs.domHash([]),               false);       // arity 1
  t.equal(spritzjs.domHash([], 1),            false);       // arity 2
  t.equal(spritzjs.domHash([], 1, 1, 1),      false);       // arity 4

  t.equal(spritzjs.domHash([],   1),          false);       // J array too short

  // hmm this looks dodgy, need to check encryptWithIV tests! .ts facades needed?
  t.equal(spritzjs.domHash([1], ""),          false);       // invalid M
  t.equal(spritzjs.domHash([1],  []),         false);       // invalid M

  t.equal(spritzjs.domHash([1],  [1], ""),    false);       // invalid r
  t.equal(spritzjs.domHash([1],  [1], []),    false);       // invalid r

  t.end();
});


test('mac should disallow invalid arguments', function (t) {

  // now here's a justification for TypeScript
  t.equal(spritzjs.mac(),                 false);       // arity 0
  t.equal(spritzjs.mac([]),               false);       // arity 1
  t.equal(spritzjs.mac([], 1),            false);       // arity 2
  t.equal(spritzjs.mac([], 1, 1, 1),      false);       // arity 4

  t.equal(spritzjs.mac([],   1),          false);       // J array too short

  // hmm this looks dodgy, need to check encryptWithIV tests! .ts facades needed?
  t.equal(spritzjs.mac([1], ""),          false);       // invalid M
  t.equal(spritzjs.mac([1],  []),         false);       // invalid M

  t.equal(spritzjs.mac([1],  [1], ""),    false);       // invalid r
  t.equal(spritzjs.mac([1],  [1], []),    false);       // invalid r

  t.end();
});
