/******************************************************************************
  spritzjs - A Spritz stream-cipher implementation in JavaScript

  Created with reference to "Spritz - a spongy RC4-like stream cipher and hash function"
  by Ronald L. Rivest and Jacob C. N. Schuldt on 2014.10.27 - http://people.csail.mit.edu/rivest/pubs/RS14.pdf

  Inspired by:
  "Security Now" podcast, episode 479 - http://twit.tv/show/security-now/479
  "Schneier on Security" - https://www.schneier.com/blog/archives/2014/10/spritz_a_new_rc.html

  Intent: Provide a literal JavaScript reference implementation from the pseudo-code provided by Rivest and Schuldt;
  allowing the reader to follow the Paper with this code serving as an accompaniment. To this end, variable/parameter names and their
  casing have been preserved, however the function names have been camel-cased for JS convention.

  It is hoped this may serve as a starting point for those who wish to explore this cipher in a JS context.

  This source file is deliberately unoptimized with the aim of readability, yet is *relatively* portable. (For example,
  "isArray" support is assumed rather than feature-detected, and may need replacing
  if you wish to run this on IE8-, or very old Firefox versions.
  See: http://kangax.github.io/compat-table/es5/#Array.isArray)

  For more information you can find the latest README.md, tests and minified versions at:

  https://github.com/therealjampers/spritzjs

  Tested in: Node.js (0.10.26+), Chrome (38+), Firefox (33+)
  *More test-vectors would be appreciated!*

  Released under the MIT license.

    - therealjampers
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
    , a
    , w
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
    // NB. N is set to 256 above, so not receiving it as passed.
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
    if (!Array.isArray(I) || I.length < 1) return false;

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

    for (v = 0; v < N_OVER_TWO_FLOOR;v++) {
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
    var v// = r
      , P = []
      ;

    if (a > 0) {
      shuffle();
    }

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
    4 Swap(S [i], S[j])
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
TODO

Encrypt(K , M )
1 KeySetup(K )
2 C = M + Squeeze(M.length)
3 return C

Decrypt(K , C )
1 KeySetup(K )
2 M = C − Squeeze(M.length)
3 return M

KeySetup(K )
1 InitializeState()
2 Absorb(K )

EncryptWithIV(K , IV , M )
1 KeySetup(K ); AbsorbStop()
2 Absorb(IV )
3 C = M + Squeeze(M.length)
4 return C
*/

  /*
  Hash(M,r)
  1 InitializeState()
  2 Absorb(M ); AbsorbStop()
  3 Absorb(r)
  4 return Squeeze(r)
  */
  function hash(M, r) {

    /* TODO refactor into common-guard assertions */
    if (!(Array.prototype.slice.call(arguments).length === 2
        && Array.isArray(M)
        && M.length > 0
        && typeof r === 'number'
        && r > 0)) return false;  // consider integer check for r

    initializeState();
    absorb(M); absorbStop();
    absorb([r & 0xff]);           // NB. restricted(!) to 255-byte hashes
    return squeeze(r);
  }

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

    return {  i: i
      , j: j
      , k: k
      , z: z
      , a: a
      , w: w
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
    // TODO add encrypt/decrypt
      hash: hash

    /* core functions as per spec */
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


  /* low-rent API exporting */
  if(typeof module !== 'undefined' && module.exports){
    /* export in Node.js style */
    module.exports = API;
  } else if (typeof window !== 'undefined' && !window.spritzjs) {
    /* augment window object */
    window.spritzjs = API;
  } else {
    /* ...requires consumer-thought */
    if (typeof console !== 'undefined') console.error("unable to export spritz API!");
  }
}());