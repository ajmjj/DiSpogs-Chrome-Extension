/* global module */
'use strict';

/**
 * Class representing the API
 */
var SpotifyWebApi = (function () {
  var _baseUri = 'https://api.spotify.com/v1';
  var _accessToken = null;
  var _promiseImplementation = null;

  var WrapPromiseWithAbort = function (promise, onAbort) {
    promise.abort = onAbort;
    return promise;
  };

  var _promiseProvider = function (promiseFunction, onAbort) {
    var returnedPromise;
    if (_promiseImplementation !== null) {
      var deferred = _promiseImplementation.defer();
      promiseFunction(
        function (resolvedResult) {
          deferred.resolve(resolvedResult);
        },
        function (rejectedResult) {
          deferred.reject(rejectedResult);
        }
      );
      returnedPromise = deferred.promise;
    } else {
      if (window.Promise) {
        returnedPromise = new window.Promise(promiseFunction);
      }
    }

    if (returnedPromise) {
      return new WrapPromiseWithAbort(returnedPromise, onAbort);
    } else {
      return null;
    }
  };

  var _extend = function () {
    var args = Array.prototype.slice.call(arguments);
    var target = args[0];
    var objects = args.slice(1);
    target = target || {};
    objects.forEach(function (object) {
      for (var j in object) {
        if (object.hasOwnProperty(j)) {
          target[j] = object[j];
        }
      }
    });
    return target;
  };

  var _buildUrl = function (url, parameters) {
    var qs = '';
    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        var value = parameters[key];
        qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
      }
    }
    if (qs.length > 0) {
      // chop off last '&'
      qs = qs.substring(0, qs.length - 1);
      url = url + '?' + qs;
    }
    return url;
  };

  var _performRequest = function (requestData, callback) {
    var req = new XMLHttpRequest();

    var promiseFunction = function (resolve, reject) {
      function success(data) {
        if (resolve) {
          resolve(data);
        }
        if (callback) {
          callback(null, data);
        }
      }

      function failure() {
        if (reject) {
          reject(req);
        }
        if (callback) {
          callback(req, null);
        }
      }

      var type = requestData.type || 'GET';
      req.open(type, _buildUrl(requestData.url, requestData.params));
      if (_accessToken) {
        req.setRequestHeader('Authorization', 'Bearer ' + _accessToken);
      }

      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          var data = null;
          try {
            data = req.responseText ? JSON.parse(req.responseText) : '';
          } catch (e) {
            console.error(e);
          }

          if (req.status >= 200 && req.status < 300) {
            success(data);
          } else {
            failure();
          }
        }
      };

      if (type === 'GET') {
        req.send(null);
      } else {
        var postData = null;
        if (requestData.postData) {
          if (requestData.contentType === 'image/jpeg') {
            postData = requestData.postData;
            req.setRequestHeader('Content-Type', requestData.contentType);
          } else {
            postData = JSON.stringify(requestData.postData);
            req.setRequestHeader('Content-Type', 'application/json');
          }
        }
        req.send(postData);
      }
    };

    if (callback) {
      promiseFunction();
      return null;
    } else {
      return _promiseProvider(promiseFunction, function () {
        req.abort();
      });
    }
  };

  var _checkParamsAndPerformRequest = function (
    requestData,
    options,
    callback,
    optionsAlwaysExtendParams
  ) {
    var opt = {};
    var cb = null;

    if (typeof options === 'object') {
      opt = options;
      cb = callback;
    } else if (typeof options === 'function') {
      cb = options;
    }

    // options extend postData, if any. Otherwise they extend parameters sent in the url
    var type = requestData.type || 'GET';
    if (type !== 'GET' && requestData.postData && !optionsAlwaysExtendParams) {
      requestData.postData = _extend(requestData.postData, opt);
    } else {
      requestData.params = _extend(requestData.params, opt);
    }
    return _performRequest(requestData, cb);
  };

  /**
   * Creates an instance of the wrapper
   * @constructor
   */
  var Constr = function () {};

  Constr.prototype = {
    constructor: SpotifyWebApi
  };

  /**
   * Fetches a resource through a generic GET request.
   *
   * @param {string} url The URL to be fetched
   * @param {function(Object,Object)} callback An optional callback
   * @return {Object} Null if a callback is provided, a `Promise` object otherwise
   */
  Constr.prototype.getGeneric = function (url, callback) {
    var requestData = {
      url: url
    };
    return _checkParamsAndPerformRequest(requestData, callback);
  };

//   /**
//    * Fetches information about the current user.
//    * See [Get Current User's Profile](https://developer.spotify.com/web-api/get-current-users-profile/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getMe = function (options, callback) {
//     var requestData = {
//       url: _baseUri + '/me'
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

//   /**
//    * Fetches an album from the Spotify catalog.
//    * See [Get an Album](https://developer.spotify.com/web-api/get-album/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {string} albumId The id of the album. If you know the Spotify URI it is easy
//    * to find the album id (e.g. spotify:album:<here_is_the_album_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getAlbum = function (albumId, options, callback) {
//     var requestData = {
//       url: _baseUri + '/albums/' + albumId
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

//   /**
//    * Fetches the tracks of an album from the Spotify catalog.
//    * See [Get an Album's Tracks](https://developer.spotify.com/web-api/get-albums-tracks/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {string} albumId The id of the album. If you know the Spotify URI it is easy
//    * to find the album id (e.g. spotify:album:<here_is_the_album_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getAlbumTracks = function (albumId, options, callback) {
//     var requestData = {
//       url: _baseUri + '/albums/' + albumId + '/tracks'
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

//   /**
//    * Fetches a track from the Spotify catalog.
//    * See [Get a Track](https://developer.spotify.com/web-api/get-track/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {string} trackId The id of the track. If you know the Spotify URI it is easy
//    * to find the track id (e.g. spotify:track:<here_is_the_track_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getTrack = function (trackId, options, callback) {
//     var requestData = {};
//     requestData.url = _baseUri + '/tracks/' + trackId;
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

//   /**
//    * Fetches multiple tracks from the Spotify catalog.
//    * See [Get Several Tracks](https://developer.spotify.com/web-api/get-several-tracks/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {Array<string>} trackIds The ids of the tracks. If you know their Spotify URI it is easy
//    * to find their track id (e.g. spotify:track:<here_is_the_track_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getTracks = function (trackIds, options, callback) {
//     var requestData = {
//       url: _baseUri + '/tracks/',
//       params: { ids: trackIds.join(',') }
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

//   /**
//    * Fetches an artist from the Spotify catalog.
//    * See [Get an Artist](https://developer.spotify.com/web-api/get-artist/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
//    * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getArtist = function (artistId, options, callback) {
//     var requestData = {
//       url: _baseUri + '/artists/' + artistId
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };


//   // can be used to suggest albums by artist
//   /**
//    * Fetches the albums of an artist from the Spotify catalog.
//    * See [Get an Artist's Albums](https://developer.spotify.com/web-api/get-artists-albums/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
//    * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getArtistAlbums = function (artistId, options, callback) {
//     var requestData = {
//       url: _baseUri + '/artists/' + artistId + '/albums'
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

//   // used to suggest similar artists
//   /**
//    * Fetches a list of artists related with a given one from the Spotify catalog.
//    * See [Get an Artist's Related Artists](https://developer.spotify.com/web-api/get-related-artists/) on
//    * the Spotify Developer site for more information about the endpoint.
//    *
//    * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
//    * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
//    * @param {Object} options A JSON object with options that can be passed
//    * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
//    * one is the error object (null if no error), and the second is the value if the request succeeded.
//    * @return {Object} Null if a callback is provided, a `Promise` object otherwise
//    */
//   Constr.prototype.getArtistRelatedArtists = function (
//     artistId,
//     options,
//     callback
//   ) {
//     var requestData = {
//       url: _baseUri + '/artists/' + artistId + '/related-artists'
//     };
//     return _checkParamsAndPerformRequest(requestData, options, callback);
//   };

  // full search (not specific)
  /**
   * Get Spotify catalog information about artists, albums, tracks or playlists that match a keyword string.
   * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
   * the Spotify Developer site for more information about the endpoint.
   *
   * @param {string} query The search query
   * @param {Array<string>} types An array of item types to search across.
   * Valid types are: 'album', 'artist', 'playlist', and 'track'.
   * @param {Object} options A JSON object with options that can be passed
   * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
   * one is the error object (null if no error), and the second is the value if the request succeeded.
   * @return {Object} Null if a callback is provided, a `Promise` object otherwise
   */
  Constr.prototype.search = function (query, types, options, callback) {
    var requestData = {
      url: _baseUri + '/search/',
      params: {
        q: query,
        type: types.join(',')
      }
    };
    return _checkParamsAndPerformRequest(requestData, options, callback);
  };

  
  // goldmine -> search specific to albums
  /**
   * Fetches albums from the Spotify catalog according to a query.
   * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
   * the Spotify Developer site for more information about the endpoint.
   *
   * @param {string} query The search query
   * @param {Object} options A JSON object with options that can be passed
   * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
   * one is the error object (null if no error), and the second is the value if the request succeeded.
   * @return {Object} Null if a callback is provided, a `Promise` object otherwise
   */
  Constr.prototype.searchAlbums = function (query, options, callback) {
    return this.search(query, ['album'], options, callback);
  };

  // search specific to artists
  /**
   * Fetches artists from the Spotify catalog according to a query.
   * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
   * the Spotify Developer site for more information about the endpoint.
   *
   * @param {string} query The search query
   * @param {Object} options A JSON object with options that can be passed
   * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
   * one is the error object (null if no error), and the second is the value if the request succeeded.
   * @return {Object} Null if a callback is provided, a `Promise` object otherwise
   */
  Constr.prototype.searchArtists = function (query, options, callback) {
    return this.search(query, ['artist'], options, callback);
  };

  // search specific to tracks
  /**
   * Fetches tracks from the Spotify catalog according to a query.
   * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
   * the Spotify Developer site for more information about the endpoint.
   *
   * @param {string} query The search query
   * @param {Object} options A JSON object with options that can be passed
   * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
   * one is the error object (null if no error), and the second is the value if the request succeeded.
   * @return {Object} Null if a callback is provided, a `Promise` object otherwise
   */
  Constr.prototype.searchTracks = function (query, options, callback) {
    return this.search(query, ['track'], options, callback);
  };


  // get access token
  /**
   * Gets the access token in use.
   *
   * @return {string} accessToken The access token
   */
  Constr.prototype.getAccessToken = function () {
    return _accessToken;
  };

  // set access token
  /**
   * Sets the access token to be used.
   * See [the Authorization Guide](https://developer.spotify.com/web-api/authorization-guide/) on
   * the Spotify Developer site for more information about obtaining an access token.
   *
   * @param {string} accessToken The access token
   * @return {void}
   */
  Constr.prototype.setAccessToken = function (accessToken) {
    _accessToken = accessToken;
  };

  /**
   * Sets an implementation of Promises/A+ to be used. E.g. Q, when.
   * See [Conformant Implementations](https://github.com/promises-aplus/promises-spec/blob/master/implementations.md)
   * for a list of some available options
   *
   * @param {Object} PromiseImplementation A Promises/A+ valid implementation
   * @throws {Error} If the implementation being set doesn't conform with Promises/A+
   * @return {void}
   */
  Constr.prototype.setPromiseImplementation = function (PromiseImplementation) {
    var valid = false;
    try {
      var p = new PromiseImplementation(function (resolve) {
        resolve();
      });
      if (typeof p.then === 'function' && typeof p.catch === 'function') {
        valid = true;
      }
    } catch (e) {
      console.error(e);
    }
    if (valid) {
      _promiseImplementation = PromiseImplementation;
    } else {
      throw new Error('Unsupported implementation of Promises/A+');
    }
  };

  return Constr;
})();

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = SpotifyWebApi;
}