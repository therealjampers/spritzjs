(function () {

  function hashGuard(M, r) {
    return (Array.prototype.slice.call(arguments).length === 2
          && Array.isArray(M)
          && M.length > 0
          && typeof r === 'number'
          && r > 0);
  }
  function encryptGuard(K, M) {
    return (Array.prototype.slice.call(arguments).length === 2
          && Array.isArray(K)
          && K.length > 0
          && Array.isArray(M)
          && M.length > 0);
  }
  function decryptGuard(K, C) {
    return (Array.prototype.slice.call(arguments).length === 2
          && Array.isArray(K)
          && K.length > 0
          && Array.isArray(C)
          && C.length > 0);
  }
  function encryptWithIVGuard(K, IV, M) {
    return (Array.prototype.slice.call(arguments).length === 3
          && Array.isArray(K)
          && K.length > 0
          && Array.isArray(IV)
          && IV.length > 0
          && Array.isArray(M)
          && M.length > 0);
  }
  function decryptWithIVGuard(K, IV, C) {
    return (Array.prototype.slice.call(arguments).length === 3
          && Array.isArray(K)
          && K.length > 0
          && Array.isArray(IV)
          && IV.length > 0
          && Array.isArray(C)
          && C.length > 0);
  }

  var facadeHighLevel = {
    hash:             hashGuard
  , encrypt:          encryptGuard
  , decrypt:          decryptGuard
  , encryptWithIV:    encryptWithIVGuard
  , decryptWithIV:    decryptWithIVGuard
  };

  if(typeof module !== 'undefined' && module.exports){
    /* export in CommonJS style */
    module.exports = facadeHighLevel;
  } else if (typeof window !== 'undefined' && !window.facadeHighLevel) {
    /* augment window object */
    window.facadeHighLevel = facadeHighLevel;
  } else {
    /* ...requires consumer-thought */
    if (typeof console !== 'undefined') console.error("unable to export facadeHighLevel!");
  }
}());