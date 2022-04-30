var __extends = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
}
var __spreadArray = function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

var __assign = function(o1, o2) {
    for (var i in o2) {
        o1[i] = o2[i];
    }

    return o1;
}

var Set = window.Set || /** @class */ (function (_super) {
    __extends(Set, _super);
    function Set(set) {
        if (set === void 0) { set = []; }
        var _this = this; _super.call(this);
        set.forEach(function (item) {
            _this.add (item)
        });
        Object.defineProperty(_this, 'hash', {
            value: Object.create(null),
            writable: true
        });
        return _this;
    }

    Set.prototype.has = function (value) {
        if (typeof value === "string" || typeof value === "number") {
            return this.hash[value] !== void 0;
        }
        else {
            return this.indexOf(value) !== -1;
        }
    };

    Set.prototype.add = function (value) {
        if (typeof value === "string" || typeof value === "number") {
            if (this.hash[value]) {
                return this;
            }
            else {
                this.hash[value] = true;
            }
        }
        else {
            if (this.indexOf(value) !== -1) {
                return this;
            }
            this.push(value);
        }
        return this;
    };

    Set.prototype.clear = function () {
        this.hash = Object.create(null);
        this.splice(0);
    };

    Set.prototype.delete = function (value) {
        if (typeof value === "string" || typeof value === "number") {
            if (this.hash[value] !== void 0) {
                delete this.hash[value];
            }
        }
        else {
            var index = this.indexOf(value);
            if (index !== -1) {
                this.splice(index, 1);
            }
        }
        this.push(value);
        return this;
    };
    return Set;
}(Array));

var Map = window.Map || /** @class */ (function (_super) {
    __extends(Map, _super);

    function Map(map) {
        if (map === void 0) { map = []; }
        var _this = this; _super.call(this);
        Object.defineProperty(_this, 'hash', {
            value: Object.create(null),
            writable: true
        });
        map.forEach(function (_a) {
            var key = _a[0], value = _a[1];
            this.set(key, value);
        });
        return _this;
    }

    Map.prototype.clear = function () {
        this.hash = Object.create(null);
        this.splice(0);
    };

    Map.prototype.delete = function (key) {
        if (typeof key === "string" || typeof key === "number") {
            if (this.hash[key] !== void 0) {
                delete this.hash[key];
            }
        }
        else {
            for (var i = 0; i < this.length; i++) {
                if (this[i][0] === key) {
                    this.splice(i, 1);
                }
            }
        }
    };

    function indexOfKey(key) {
        for (var i = 0; i < this.length; i++) {
            if (this[i][0] === key) {
                return i;
            }
        }
        return -1;
    }

    Map.prototype.set = function (key, value) {
        if (typeof key === "string" || typeof key === "number") {
            this.hash[key] = value;
        }
        else {
            var index = indexOfKey.call(this, key);
            if (index === -1) {
                this.push([key, value]);
            }
            else {
                this[index][1] = value;
            }
        }
    };


    Map.prototype.has = function (key) {
        if (typeof key === "string" || typeof key === "number") {
            return !!this.hash[key];
        }
        else {
            return indexOfKey.call(this, key) !== -1;
        }
    };

    Map.prototype.get = function (key) {
        if (typeof key === "string" || typeof key === "number") {
            return this.hash[key];
        }
        else {
            var index = indexOfKey.call(this, key);
            if (index !== -1) {
                return this[index][1];
            }
            else {
                return void 0;
            }
        }
    };

    return Map;
}(Array));

window.Reflect = window.Reflect || {
    has: function (obj, p) {
        for (var i in obj) {
            if (i == p) return true;
        }
        return false;
    },
    ownKeys: function (obj) {
        var ret = [];

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret.push(i);
            }
        }

        return ret;
    }
}

window.Proxy = window.Proxy || function (obj) {
    return obj;
};
