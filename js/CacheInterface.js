var CacheInterface = function() {};

CacheInterface.Class = function(attributes) {
  CacheInterface.extend(this, attributes);
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
    this.extend(atts, {
      defaultLifetime: 10,
      bucket: 'cache'
    });
  },

  setItem: function(key, value, expires) {
    
    if(!expires) {
      expires = this.defaultLifetime;
    }

    lscache.setBucket(this.bucket);
    lscache.set(key, value, expires);
  },

  getItem: function(key) {
    lscache.setBucket(this.bucket);
    return lscache.get(key);
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
