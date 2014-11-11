/******************************************************************************
  spritzjs - A Spritz stream-cipher implementation in JavaScript

  Created with reference to "Spritz - a spongy RC4-like stream cipher and hash function"
  by Ronald L. Rivest and Jacob C. N. Schuldt on 2014.10.27

  Intent:
  Provide a literal JavaScript reference implementation from the excellent pseudo-code
  created by Rivest and Schuldt; allowing the reader to follow the Paper with this code
  serving as an accompaniment. To this end, variable/parameter names and their casing have
  been preserved, however the function names have been camelCased for JS convention.

  It is hoped this may serve as a starting point for those who wish to explore this cipher
  in a JS context.

  This file is deliberately unoptimized with the aim of readability,
  yet is *relatively* portable. (For example, "isArray" support is assumed rather than
  feature-detected, and may need replacing if you wish to run this on IE8-, or very old
  Firefox versions.
  See: http://kangax.github.io/compat-table/es5/#Array.isArray

  Tested in: Node.js (0.10.26+), Chrome (38+), Firefox (33+)

  References:
  "Spritz - a spongy RC4-like stream cipher and hash function"
    by Rivest and Schuldt - http://people.csail.mit.edu/rivest/pubs/RS14.pdf
  "Security Now" podcast, episode 479 - http://twit.tv/show/security-now/479
  "Security Now" podcast, episode 480 - http://twit.tv/show/security-now/480
  "Schneier on Security" - https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html

  For more information you can find the latest README.md, tests and other versions at:

  https://github.com/therealjampers/spritzjs

  Test-vectors appreciated!

  Released under the MIT license.

    - therealjampers 2014

******************************************************************************/

(function () {

  "use strict";
  /*
    N is apparently arbitrary, but we shall elect to use byte-size N-values throughout
  */
  var N =                 256
    , N_MINUS_1 =         N - 1
    , N_OVER_TWO_FLOOR =  Math.floor(N / 2)
    , TWO_N =             2 * N
    , MAX_ABSORB_LEN =    Math.floor(N / 4)
    /*
      premature optimization?
    */
    ;

  /*
    The state consists of byte registers i, j, k, z, w, and a, and
    an array S containing a permutation of {0, 1,... , N − 1}.
  */
  var i
    , j
    , k
    , z
    , w
    , a
    , S
    ;

  /******************
    core functions
  *******************/

  /*
    InitializeState(N)
    1 i = j = k = z = a = 0
    2 w = 1
    3 for v = 0 to N - 1
    4   S[v] = v
  */
  function initializeState() {
    // NB. N is set to 256 in the above code, so we are not receiving it as per literal spec
    var v;

    i = j = k = z = a = 0;
    w = 1;

    S = [];
    for (v = 0; v < N; v++) {
      S[v] = v;
    }
  }

  /*
    Absorb(I)
    1 for v = 0 to I.length - 1
    2   AbsorbByte(I[v])
  */
  function absorb(I) {
    var v;
    /*
      basic validation of I
      consider bounds-checking and deep-checking of each N-value such that they are in the valid range (0 <= x < N)
    */
    if (!(Array.isArray(I) && I.length > 0)) return false;

    for (v = 0; v < I.length; v++) {
      absorbByte(I[v]);
    }

    return true;
  }

  /*
    AbsorbByte(b)
    1 AbsorbNibble(low(b))
    2 AbsorbNibble(high(b))
  */
  function absorbByte(b) {
    absorbNibble(low(b));
    absorbNibble(high(b));
  }

  /*
    AbsorbNibble(x)
    1 if a = N/2
    2   Shuffle()
    3 Swap(S[a],S[N/2+x])
    4 a=a+1
  */
  function absorbNibble(x) {
    if (a === N_OVER_TWO_FLOOR){
      shuffle();
    }

    swap(a, madd(N_OVER_TWO_FLOOR,x));

    a = madd(a, 1);
  }

  /*
    AbsorbStop()
    1 if a=N/2
    2   Shuffle()
    3 a=a+1
  */
  function absorbStop() {
    if (a === N_OVER_TWO_FLOOR){
      shuffle();
    }
    a = madd(a, 1);
  }

  /*
    Shuffle()
    1 Whip(2N)
    2 Crush()
    3 Whip(2N)
    4 Crush()
    5 Whip(2N)
    6 a=0
  */
  function shuffle() {
    whip(TWO_N);
    crush();
    whip(TWO_N);
    crush();
    whip(TWO_N);
    a = 0;
  }

  /*
    Whip(r)
    1 for v=0 to r−1
    2   Update()
    3 do w=w+1
    4 until gcd(w,N)=1
  */
  function whip(r) {
    var v;
    for (v = 0; v < r; v++) {
      update();
    }
    do {
      w = madd(w, 1);
    } while (gcd(w, N) !== 1);
    // NB. a simple-case assumption is that if N is a power of 2 then one could instead use:
    // w = madd(w, 2);
  }

  /*
    Crush()
    1 for v=0 to N/2−1
    2   if S[v]>S[N−1−v]
    3     Swap(S[v], S[N − 1 − v])
  */
  function crush() {
    var v
      , index
      ;

    for (v = 0; v < N_OVER_TWO_FLOOR; v++) {
      index = N_MINUS_1 - v;

      if (S[v] > S[index]) {
        swap(v, index);
      }
    }
  }

  /*
    Squeeze(r)
    1 if a>0
    2   Shuffle()
    3 P = Array.New(r)
    4 for v=0 to r−1
    5   P[v] = Drip()
    6 return P
  */
  function squeeze(r) {
    var v
      , P
      ;

    if (a > 0) {
      shuffle();
    }

    P = [];
    for (v = 0; v < r; v++) {
      P[v] = drip();
    }
    return P;
  }

  /*
    Drip()
    1 if a>0
    2   Shuffle()
    3 Update()
    4 return Output()
  */
  function drip() {
    if (a > 0) {
      shuffle();
    }
    update();
    return output();
  }

  /*
  Update()
    1 i=i+w
    2 j=k+S[j+S[i]]
    3 k=i+k+S[j]
    4 Swap(S[i], S[j])
  */
  function update() {
    i = madd(i, w);
    j = madd(k, S[madd(j, S[i])]);
    k = madd(i + k, S[j]);
    swap(i, j);
  }

  /*
  Output()
    1 z = S[j+S[i+S[z+k]]]
    2 return z
  */
  function output() {
    z = S[
      madd(j, S[
        madd(i, S[
          madd(z, k)
        ])
      ])
    ];
    return z;
  }

  /******************
    high-level functions (target API)
  *******************/

  /*
  Hash(M,r)
  1 InitializeState()
  2 Absorb(M ); AbsorbStop()
  3 Absorb(r)
  4 return Squeeze(r)
  */
  function hash(M, r) {

    initializeState();
    absorb(M); absorbStop();
    absorb([r & 0xff]);           // NB. restricted(!) to 255-byte hashes
    return squeeze(r);
  }

  /*
  Encrypt(K, M)
  1 KeySetup(K)
  2 C = M + Squeeze(M.length)
  3 return C
  */
  function encrypt(K, M) {

    var C = []
      , stream
      , i
      ;

    keySetup(K);
    stream = squeeze(M.length);
    for (i = 0; i < M.length; i++) {
      C[i] = madd(M[i], stream[i]);
      // NB. this could be xor instead of modulo addition
    }
    return C;
  }

  /*
  Decrypt(K , C)
  1 KeySetup(K)
  2 M = C − Squeeze(M.length)       <--- this should be C.length, IMHO
  3 return M
  */
  function decrypt(K, C) {

    var M = []
      , stream
      , i
      ;

    keySetup(K);
    stream = squeeze(C.length);
    for (i = 0; i < C.length; i++) {
      M[i] = msub(C[i], stream[i]);
      // NB. this could be xor instead of modulo subtraction
    }
    return M;
  }

  /*
  EncryptWithIV(K, IV, M)
  1 KeySetup(K); AbsorbStop()
  2 Absorb(IV)
  3 C = M + Squeeze(M.length)
  4 return C
  */
  function encryptWithIV(K, IV, M) {
    var C = []
      , stream
      , i
      ;

    keySetup(K); absorbStop();
    absorb(IV);

    stream = squeeze(M.length);
    for (i = 0; i < M.length; i++) {
      C[i] = madd(M[i], stream[i]);
      // NB. this could be xor instead of modulo addition
    }
    return C;
  }

  /*
  NB. This is not in the Paper, it is implied
  DecryptWithIV(K, IV, C)
  1 KeySetup(K); AbsorbStop()
  2 Absorb(IV)
  3 M = C - Squeeze(C.length)
  4 return M
  */
  function decryptWithIV(K, IV, C) {
    var M = []
      , stream
      , i
      ;

    keySetup(K); absorbStop();
    absorb(IV);

    stream = squeeze(C.length);
    for (i = 0; i < C.length; i++) {
      M[i] = msub(C[i], stream[i]);
      // NB. this could be xor instead of modulo subtraction
    }
    return M;
  }

  /*
  KeySetup(K)
  1 InitializeState()
  2 Absorb(K)
  */
  function keySetup(K) {

    /* TODO refactor into some common guard functions
      NB. we are striving for readibility and Paper->Code mapping
      but we can/should proxy the result of absorb when optimizing
    */
    if (!(Array.prototype.slice.call(arguments).length === 1
        && Array.isArray(K)
        && K.length > 0)) return false;

    initializeState();
    absorb(K);
    return true;
  }

  /* TODO
DomHash(J,M,r)
1 InitializeState()
2 Absorb(J ); AbsorbStop()
3 Absorb(M ); AbsorbStop()
4 Absorb(r)
5 return Squeeze(r )


MAC(K,M,r)
1 InitializeState()
2 Absorb(K ); AbsorbStop()
3 Absorb(M ); AbsorbStop()
4 Absorb(r)
5 return Squeeze(r )

AEAD(K,Z,H,M,r)
1 InitializeState()
2 Absorb(K ); AbsorbStop()
3 Absorb(Z ); AbsorbStop()
4 Absorb(H ); AbsorbStop()
5 DivideMintoblocksM1,M2,...,Mt,
each N/4 bytes long except possibly the last.
6 fori=1tot
7 Output Ci = Mi + Squeeze(Mi . length )
8 Absorb(Ci )
9 AbsorbStop()
6
10 11
Absorb(r)
Output Squeeze(r )

  */


  /******************
    utility functions
  *******************/

  /*
    addition modulo N
  */
  function madd(a, b) {
    return (a + b) % N;
    // return (a + b) & 0xff;      // when N = 256, 0xff = N - 1
  }

  /*
    subtraction modulo N. assumes a and b are in N-value range
  */
  function msub(a, b) {
    return madd(N, a - b);
  }

  /*
    get the low nibble of b
  */
  function low(b) {
    return b & 0xf;
  }

  /*
    get the high nibble of b
  */
  function high(b) {
    /* zero-fill right shift chosen, however if there were bits back there we're in trouble anyway! */
    return b >>> 4 & 0xf;
  }

  /*
    convenience function to swap S values at pointers p1 and p2
  */
  function swap(p1, p2) {
    var tmp = S[p1];
    S[p1] = S[p2];
    S[p2] = tmp;
  }

  /*
    Greatest Common Divisor - Euclid's algorithm
    gcd(a, 0) = a
    gcd(a, b) = gcd(b,a mod b)
  */
  function gcd(a, b) {
    var t;
    while (b != 0) {
      t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  /*
    allow retrieval of the (initialized) internal cipher-state as a plain object
    NB. only for testing purposes, should not be exposed in "production"
  */
  function getState() {
    /* basic guard against unitialized state */
    if (!Array.isArray(S)) return false;

    return {
        i: i
      , j: j
      , k: k
      , z: z
      , w: w
      , a: a
      /* return the permutation by value, not reference, to avoid potential fubars */
      , S: S.slice(0)
    };
  }

  /*
    API definition
    feel free to comment out any that should not be exposed
  */
  var API = {
    /* high-level functions */
      hash: hash
    , encrypt: encrypt
    , decrypt: decrypt
    , encryptWithIV: encryptWithIV
    , decryptWithIV: decryptWithIV

    /* core functions */
    , keySetup: keySetup

    , initializeState: initializeState
    , absorb: absorb
    , absorbByte: absorbByte
    , absorbNibble: absorbNibble
    , absorbStop: absorbStop
    , shuffle: shuffle
    , whip: whip
    , crush: crush
    , squeeze: squeeze
    , drip: drip
    , update: update
    , output: output

    /* utility functions */
    , getState: getState
  };

  /* NB. breaking-change from 0.3.12, spritzjs is now a constructor with optional facade */
  function ctor(facadeOptional) {

    // if there is a facade provided and the keys match API methods
    // then call the guard functions first and return the core results afterwards
    // reassign API to the modified facade
    if (typeof facadeOptional === 'object') {
      for (var key in facadeOptional) {
        if (API.hasOwnProperty(key)) {
          facadeOptional[key] = (function (functionName, guardFunction, spritzjsFunction) {
            return function () {
              if (!guardFunction.apply({}, arguments)) return false;
              return spritzjsFunction.apply({}, arguments);
            };
          }(key, facadeOptional[key], API[key]));
        }
      }
      API = facadeOptional;
    }
    /*
      Object.freeze prevents trivial XSS modification of spritzjs:

      eg.
      spritzjs.hash=function(){return 'pwned'}
      spritzjs.hash([65,66,67], 32)             //  -> [2, 143, 162,..., ]

    */
    return Object.freeze(API);
  }

  if(typeof module !== 'undefined' && module.exports){
    /* export in Node.js style */
    module.exports = ctor;
  } else if (typeof window !== 'undefined' && !window.spritzjs) {
    /* augment window object */
    window.spritzjs = ctor;
  } else {
    /* ...requires consumer-thought */
    if (typeof console !== 'undefined') console.error("unable to export spritzjs ctor!");
  }
}());