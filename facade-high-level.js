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
  function domHashGuard(J, M, r) {
    return (Array.prototype.slice.call(arguments).length === 3
          && J.length > 0
          && Array.isArray(J)
          && M.length > 0
          && typeof r === 'number'
          && r > 0);
  }
  /* TODO: whilst domHash domain is possibly less stringent we may wish to
    assert K length for mac */
  function macGuard(K, M, r) {
    return (Array.prototype.slice.call(arguments).length === 3
          && K.length > 0
          && Array.isArray(K)
          && M.length > 0
          && typeof r === 'number'
          && r > 0);
  }

  var facadeHighLevel = {
    hash:             hashGuard
  , encrypt:          encryptGuard
  , decrypt:          decryptGuard
  , encryptWithIV:    encryptWithIVGuard
  , decryptWithIV:    decryptWithIVGuard
  , domHash:          domHashGuard
  , mac:              macGuard
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