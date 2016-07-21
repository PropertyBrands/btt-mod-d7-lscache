var CacheInterface = function() {};

CacheInterface.Class = function(attributes) {
  CacheInterface.extend(this, attributes);
};

CacheInterface.Class.extend = function (protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && Object.prototype.hasOwnProperty.call(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  // Add static properties to the constructor function, if supplied.
  CacheInterface.extend(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) CacheInterface.extend(child.prototype, protoProps);

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};

CacheInterface.extend = function (child) {
  // From _.extend
  var obj = Array.prototype.slice.call(arguments, 1);

  // From _.extend
  var iterator = function(source) {
    if (source) {
      for (var prop in source) {
        child[prop] = source[prop];
      }
    }
  };

  // From _.each
  if (obj == null) return;
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      iterator.call(undefined, obj[i], i, obj);
    }
  } else {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        iterator.call(undefined, obj[key], key, obj);
      }
    }
  }

  return child;
};

CacheInterface.Bucket = CacheInterface.Class.extend({

  constructor: function(atts) {
    CacheInterface.extend(this, {
      defaultLifetime: 10,
      bucket: 'cache'
    }, atts);
  },

  setItem: function(key, value, expires) {
    var item = LZString.compressToUTF16(JSON.stringify({
      value: value
    }))

    if(!expires) {
      expires = this.defaultLifetime;
    }

    lscache.setBucket(this.bucket);
    lscache.set(key, item, expires);
  },

  getItem: function(key) {
    var val, stored;
    lscache.setBucket(this.bucket);
    val = lscache.get(key);
    if(val) {
      stored = JSON.parse(LZString.decompressFromUTF16(val))
      val = stored.value
    }
    return val;
  },

  flush: function(expired) {
    lscache.setBucket(this.bucket);
    if(expired) {
      lscache.flushExpired();
    }
    else {
      lscache.flush();
    }
  }
});
