var VERSION = 1.0;

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

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

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

String.prototype.isEmpty = function () {
    String.prototype.white = /^\s*$/g;
    return this.length === 0 || this.white.test (this);
};

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

Array.prototype.findByID = function (key, ID) {
    var sID = String (ID);
    var nID = Number (ID);

    for (i = 0; i < this.length; i++) {
        if (this[i][key] === sID || this[i][key] === nID)
            return i;
    }
    return -1;
};

Array.prototype.findAllByID = function (key, ID) {
    var sID = String (ID);
    var nID = Number (ID);
    var result = [];
    for (i = 0; i < this.length; i++) {
        if (this[i][key] === sID || this[i][key] === nID)
            result.push (this[i]);
    }
    return result;
};

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

(function () {
    var XBase = {
        taskAttrs: ["id", "title", "description", "state", "groupID"],
        groupAttrs: ["id", "title", "description"],
        autoInc: ["groupID", "taskID"]
    };
    var _isSupported = null;

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.init = function () {
        if (!XBase.isSupported ())
            return;

        if (!localStorage.hasItem ("autoInc")
                || (!localStorage.hasItem ("version") || localStorage.getItem ('version') < VERSION)
                || (XBase.getGroups ().length === 0)) {
            XBase.firstTime ();
        }
    };


    XBase.isSupported = function () {
        if (_isSupported === null) {
            var uid = "check" + Math.random (), result;
            try {
                localStorage.setItem (uid, uid);
                result = localStorage.getItem (uid) === uid;
                localStorage.removeItem (uid);
                _isSupported = result && localStorage;
            } catch (e) {
                _isSupported = false;
            }
        }

        return _isSupported;
    };


    XBase.firstTime = function () {
        XBase.clear ();
        console.log ('XBase creation');
        localStorage.setObject ("autoInc", {groupID: 0, taskID: 0});
        localStorage.setObject ("tasks", []);
        localStorage.setObject ("groups", []);
        localStorage.setItem ('version', VERSION);

        XBase.addGroup ('Hlavní skupina', 'Ty nejdůležitější úkoly');
        XBase.addTask ('Váš první úkol!', 'V každé skupině může být mnoho úkolů. <br />kliknutím na tento text, označíte úkol za splněný', -1, 0);
        XBase.addTask ('Váš druhý úkol!', 'Smazání nebo jinou úpravu úkolu, provedete kliknutím na ikonu vpravo', -1, 0);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.addTask = function (title, description, state, groupID, taskID) {
        var task;
        var newID = taskID || XBase.incTaskID ();
        var array = XBase.getTasks ();
        array.push (task = Task (title, description, Number (state), groupID, newID));
        XBase.setTasks (array);
        return task;
    };


    XBase.editTask = function (taskID, title, description, state, groupID) {
        var array = XBase.getTasks ();
        var index = array.findByID ("tid", taskID);
        if (index === -1)
            return null;

        var task = array[index];
        task.tit = title === undefined ? task.tit : title;
        task.des = description === undefined ? task.des : description;
        task.sta = Number (state === undefined ? task.sta : state);
        task.gid = groupID === undefined ? task.gid : groupID;
        array[index] = task;
        XBase.setTasks (array);
        return task;
    };

    XBase.getTask = function (taskID) {
        var array = XBase.getTasks ();
        var index = array.findByID ("tid", taskID);
        if (index === -1)
            return null;
        return array[index];
    };

    XBase.inverseTaskState = function (taskID) {
        var task = XBase.getTask (taskID);
        if (task === null)
            return null;

        return XBase.editTask (taskID, undefined, undefined, Number (task.sta) * -1);
    };

    XBase.deleteTask = function (taskID) {
        var tasks = XBase.getTasks ();
        var index = tasks.findByID ("tid", taskID);
        if (index === -1)
            return null;

        tasks.splice (index, 1);
        localStorage.removeItem ('image-' + taskID);
        XBase.setTasks (tasks);
        return tasks;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.addGroup = function (title, description, groupID) {
        var group;
        var newID = groupID || XBase.incGroupID ();
        var array = XBase.getGroups ();
        array.push (group = Group (title, description, newID));
        XBase.setGroups (array);
        return group;
    };

    XBase.editGroup = function (groupID, title, description) {
        var array = XBase.getGroups ();
        var index = array.findByID ("gid", groupID);
        if (index === -1)
            return null;

        var item = array[index];
        item.tit = title === undefined ? item.tit : title;
        item.des = description === undefined ? item.des : description;
        array[index] = item;
        XBase.setGroups (array);
        return item;
    };

    XBase.getGroup = function (groupID) {
        var array = XBase.getGroups ();
        var index = array.findByID ("gid", groupID);
        if (index === -1)
            return null;
        return array[index];
    };


    XBase.deleteGroup = function (groupID) {
        var groups = XBase.getGroups ();
        var tasks = XBase.getGroupTasks (groupID);
        var index = groups.findByID ("gid", groupID);
        if (index === -1)
            return null;


        //# deleting tasks
        for (var i = 0, l = tasks.length; i < l; i++)
            XBase.deleteTask (tasks[i].tid);

        groups.splice (index, 1);
        XBase.setGroups (groups);
        return groups;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.getGroupTasks = function (groupID) {
        var array = XBase.getTasks ();
        return array.findAllByID ("gid", groupID);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.clear = function () {
        localStorage.clear ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.setImage = function (taskID, imageData) {
        localStorage.setItem ('image-' + taskID, imageData);
    };

    XBase.deleteImage = function (taskID) {
        localStorage.removeItem ('image-' + taskID);
    };

    XBase.getImage = function (taskID) {
        return localStorage.getItem ('image-' + taskID);
    };

    XBase.hasImage = function (taskID) {
        return localStorage.hasItem ('image-' + taskID);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.incTaskID = function () {
        return XBase.incID ("taskID");
    };

    XBase.incGroupID = function () {
        return XBase.incID ("groupID");
    };

    XBase.incID = function (key) {
        var obj = localStorage.getObject ("autoInc");
        var id = obj[key];
        obj[key] = id + 1;
        localStorage.setObject ("autoInc", obj);
        return id;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.setImage = function (taskID, imageData) {
        localStorage.setItem ('image-' + taskID, imageData);
    };

    XBase.deleteImage = function (taskID) {
        localStorage.removeItem ('image-' + taskID);
    };

    XBase.getImage = function (taskID) {
        return localStorage.getItem ('image-' + taskID);
    };

    XBase.hasImage = function (taskID) {
        return localStorage.hasItem ('image-' + taskID);
    };


//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    XBase.getTasks = function () {
        return localStorage.getObject ("tasks");
    };

    XBase.setTasks = function (array) {
        return localStorage.setObject ("tasks", array);
    };

    XBase.getGroups = function () {
        return localStorage.getObject ("groups");
    };

    XBase.setGroups = function (array) {
        return localStorage.setObject ("groups", array);
    };

    window.XBase = XBase;
}) ();

//----------------------------------------------------------------------------------------------------------------------

function Task (_title, _description, _state, _groupID, _taskID) {
    return {
        "tid": _taskID || 0,
        "gid": _groupID || 0,
        "tit": _title,
        "des": _description,
        "sta": _state
    };
}

function Group (_title, _description, _groupID) {
    return {
        "gid": _groupID || 0,
        "tit": _title,
        "des": _description
    };
}