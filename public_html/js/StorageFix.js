Storage.prototype.setObject = function (key, value) {
    localStorage.setItem (key, JSON.stringify (value));
    return value;
};

Storage.prototype.getObject = function (key) {
    return JSON.parse (localStorage.getItem (key));
};

Storage.prototype.hasItem = function (key) {
    return this.hasOwnProperty (key) && this.getItem (key) !== null;
};

Storage.prototype.hasObject = function (key) {
    return this.hasOwnProperty (key) && this.getItem (key) !== null;
};