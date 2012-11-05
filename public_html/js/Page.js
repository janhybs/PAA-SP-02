(function () {
    var page = {
    };

    var currentGroup = null;
    var currentTask = null;
    var groups = [];
    var currentSection = null;
    var imageData = null;
    var _isSupported = null;


    page.init = function () {
        XBase.init ();

        //# no local storage, no content
        if (!XBase.isSupported ())
            return;


        //--------------------------------------------------------------------------------------------------------------

        $ ('#imageDrawNew').on ('click', function (e) {
            e.preventDefault ();
            page.showDrawSomething ();
        });

        $ ('#imageClearNew').on ('click', function (e) {
            e.preventDefault ();
            $ ('#imageNew').hide ();
            $ ('#imageNew').attr ('src', "");
            imageData = null;
            $ ('#imageClearNew').hide ();
        });

        $ ('#imageDrawEdit').on ('click', function (e) {
            e.preventDefault ();
            page.showDrawSomething ();
        });

        $ ('#imageClearEdit').on ('click', function (e) {
            e.preventDefault ();
            $ ('#imageEdit').hide ();
            $ ('#imageEdit').attr ('src', "");
            imageData = null;
            $ ('#imageClearEdit').hide ();
        });

        //--------------------------------------------------------------------------------------------------------------

        page.loadGroups ();
    };


    page.isSupported = function () {
        if (_isSupported === null) {
            _isSupported = XBase.isSupported ();
        }

        return _isSupported;
    };

    page.loadGroups = function () {
        var items = XBase.getGroups ();
        groups = [];
        var innerHTML = "", firstID = null;
        for (var i = 0, l = items.length; i < l; i++) {
            if (firstID === null)
                firstID = items[i].gid;
            innerHTML += page.createGroupElement (items[i], i);
            groups.push (items[i].gid);
        }

        $ ("#groupList").html (l === 0 ? '<li class="empty">No groups</li>' : innerHTML);
        $ ("#groupList li .action").on ('click', page.onGroupAction);

        registerAdvancedListeners ($ ("#groupList li a").find ());
        $ ("#groupList li a").on ('horizontalswipe', page.onGroupAction);

        if (firstID !== null)
            page.loadTasks (firstID);
    };


    page.loadTasks = function (groupID) {
        page.selectGroup (groupID);
        currentGroup = groupID;

        var tasks = XBase.getGroupTasks (groupID);
        var innerHTML = '';
        for (var i = 0, l = tasks.length; i < l; i++)
            innerHTML += page.createTaskElement (tasks[i], i);

        $ ("#taskList").html (l === 0 ? '<li class="empty">No Tasks</li>' : innerHTML);
        $ ("#taskList li .action").on ('click', page.onTaskAction);

        registerAdvancedListeners ($ ("#taskList li a").find ());
        $ ("#taskList li a").on ('horizontalswipe', page.onTaskAction);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.onGroupAction = function (event) {
        page.showEditGroupForm ($ (this.nodeName === "A" ? this : this.nextElementSibling).attr ('id').substring (('group-').length));
    };

    page.onTaskAction = function (event) {
        page.showEditTaskForm ($ (this.nodeName === "A" ? this : this.nextElementSibling).attr ('id').substring (('task-').length));
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.createGroupElement = function (group) {
        return '\
        <li>\
            <div>\
                <div class="action"></div>\
                <a href="#" onclick="page.loadTasks (' + group.gid + ');" id="group-' + group.gid + '" class="">\
                    <h2>' + group.tit + '</h2>\
                    <p>' + group.des + '</p>\
                </a>\
            </div>\
        </li>';
    };

    page.createTaskElement = function (task) {
        var imageData = XBase.hasImage (task.tid) ? XBase.getImage (task.tid) : null;
        var img = imageData === null ? '<img src="" style="display: none" />' : '<img src="' + imageData + '" />';
        return '\
        <li>\
            <div>\
                <div class="action"></div>\
                <a href="#" onclick="page.invertTaskStatus(' + task.tid + ')" id="task-' + task.tid + '" class="' + (task.sta === 1 ? "complete" : "incomplete") + '">\
                    ' + img + '\
                    <h2>' + task.tit + '</h2>\
                    <p>' + task.des + '</p>\
                    <div style="clear: left" ></div>\
                </a>\
            </div>\
        </li>';
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.invertTaskStatus = function (taskID) {
        var task = XBase.inverseTaskState (taskID);
        var item = document.getElementById ('task-' + taskID);
        item.setAttribute ('class', task.sta === 1 ? "complete" : "incomplete");
    };


    page.selectGroup = function (groupID) {
        $ ('#groupList li').cls ("selected", "remove");
        $ ($ ('#group-' + groupID).find ().parentNode.parentNode).cls ("selected", "add");
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.showEditGroupForm = function (groupID) {
        page.hideAllForms ();
        $ ("#editGroupForm").show ();
        currentSection = 'editGroup';

        var group = XBase.getGroup (groupID);
        $ ('#editGroupID').val (groupID);

        $ ('#groupTitleEdit').val (group.tit);
        $ ('#groupDescriptionEdit').val (group.des);
    };

    page.showEditTaskForm = function (taskID) {
        page.hideAllForms ();
        $ ("#editTaskForm").show ();
        currentSection = 'editTask';
        currentTask = taskID;


        var hasImage = XBase.hasImage (taskID);
        if (hasImage) {
            $ ('#imageClearEdit').show ();
            $ ('#imageEdit').show ();
            $ ('#imageEdit').attr ("src", imageData = XBase.getImage (taskID));
        } else {
            $ ('#imageDrawClear').hide ();
            imageData = null;
        }


        var task = XBase.getTask (taskID);
        $ ('#editTaskID').val (taskID);

        $ ('#taskTitleEdit').val (task.tit);
        $ ('#taskDescriptionEdit').val (task.des);
        $ ('#taskStateEdit').find ().value = task.sta;


        var groups = XBase.getGroups ();
        var innerHTML = "";
        for (var i = 0, l = groups.length; i < l; i++)
            innerHTML += '<option value="' + groups[i].gid + '">' + groups[i].tit + '</option>';

        $ ("#groupIDEdit").html (innerHTML);
        $ ('#groupIDEdit').find ().value = task.gid;
    };

    page.showNewTaskForm = function () {
        page.hideAllForms ();
        $ ("#newTaskForm").show ();
        currentSection = 'newTask';

        var groups = XBase.getGroups ();
        var innerHTML = "";
        for (var i = 0, l = groups.length; i < l; i++)
            innerHTML += '<option value="' + groups[i].gid + '">' + groups[i].tit + '</option>';

        $ ("#groupIDNew").html (innerHTML);
        $ ('#groupIDNew').find ().value = currentGroup;
    };

    page.showNewGroupForm = function () {
        page.hideAllForms ();
        $ ("#newGroupForm").show ();
        currentSection = 'newGroup';
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.hideNewTaskForm = function () {
        $ ("#newTaskForm").hide ();
    };

    page.hideNewGroupForm = function () {
        $ ("#newGroupForm").hide ();
    };

    page.hideEditTaskForm = function () {
        $ ("#editTaskForm").hide ();
    };

    page.hideEditGroupForm = function () {
        $ ("#editGroupForm").hide ();
    };

    page.hideAllForms = function () {
        page.hideNewTaskForm ();
        page.hideNewGroupForm ();
        page.hideEditTaskForm ();
        page.hideEditGroupForm ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.addNewTaskFromForm = function () {
        var task,
                tit = $ ('#taskTitleNew').val (),
                des = $ ('#taskDescriptionNew').val (),
                sta = $ ('#taskStateNew').val (),
                gid = $ ('#groupIDNew').val ();

        if (tit.isEmpty ()) {
            $ ('#taskTitleNew').find ().focus ();
            return alert ('Please fill task title');
        }


        task = XBase.addTask (tit, des, sta, gid);
        if (imageData !== null) {
            XBase.setImage (task.tid, imageData);
        }

        page.hideNewTaskForm ();
        page.loadTasks (gid);
        imageData = null;
    };


    page.addNewGroupFromForm = function () {
        var group,
                tit = $ ('#groupTitleNew').val (),
                des = $ ('#groupDescriptionNew').val ();

        if (tit.isEmpty ()) {
            $ ('#groupTitleNew').find ().focus ();
            return alert ('Please fill group title');
        }

        var group = XBase.addGroup (tit, des);

        page.hideNewGroupForm ();
        page.loadGroups ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.editGroupFromForm = function () {
        var group,
                gid = $ ('#editGroupID').val (),
                tit = $ ('#groupTitleEdit').val (),
                des = $ ('#groupDescriptionEdit').val ();

        if (tit.isEmpty ()) {
            $ ('#groupTitleEdit').find ().focus ();
            return alert ('Please fill group title');
        }

        group = XBase.editGroup (gid, tit, des);

        page.hideEditGroupForm ();
        page.loadGroups ();
    };


    page.editTaskFromForm = function () {
        var task,
                tid = $ ('#editTaskID').val (),
                tit = $ ('#taskTitleEdit').val (),
                des = $ ('#taskDescriptionEdit').val (),
                sta = $ ('#taskStateEdit').val (),
                gid = $ ('#groupIDEdit').val ();

        if (tit.isEmpty ()) {
            $ ('#taskTitleEdit').find ().focus ();
            return alert ('Please fill task title');
        }

        task = XBase.editTask (tid, tit, des, sta, gid);

        if (imageData !== null)
            XBase.setImage (tid, imageData);
        else
            XBase.deleteImage (tid);

        page.hideEditTaskForm ();
        page.loadTasks (currentGroup);
        imageData = null;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.deleteGroup = function () {
        var groupID = $ ('#editGroupID').val ();
        if (groupID.length === 0)
            return;

        XBase.deleteGroup (groupID);
        page.hideEditGroupForm ();
        page.loadGroups ();
    };

    page.deleteTask = function () {
        var taskID = $ ('#editTaskID').val ();
        if (taskID.length === 0)
            return;

        XBase.deleteTask (taskID);
        page.loadTasks (currentGroup);
        page.hideEditTaskForm ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    page.prevGroup = function () {
        var index = groups.indexOf (currentGroup);
        if (index === 0)
            index = groups.length;
        page.loadTasks (groups[index - 1]);
    };

    page.nextGroup = function () {
        var index = groups.indexOf (currentGroup);
        if (index === groups.length - 1)
            index = -1;
        page.init ();
        page.loadTasks (groups[index + 1]);
    };


    page.showDrawSomething = function () {
        $ ('#drawSomething').show ();
        DrawSomething.clearCanvas ();

        if (currentSection === 'editTask')
            $ ('#editTaskForm').hide ();
        else if (currentSection === 'newTask')
            $ ('#newTaskForm').hide ();
    };

    page.hideDrawSomething = function (attach) {
        $ ('#drawSomething').hide ();
        if (currentSection === 'editTask')
            $ ('#editTaskForm').show ();
        else if (currentSection === 'newTask')
            $ ('#newTaskForm').show ();


        //# cancel
        if (attach === false) {
            switch (currentSection) {
                case 'editTask':
                    if (imageData === null) {
                        $ ('#imageEdit').hide ();
                        $ ('#imageEdit').attr ('src', "");
                        $ ('#imageClearEdit').hide ();
                    } else {
                        $ ('#imageEdit').show ();
                        $ ('#imageEdit').attr ('src', imageData);
                        $ ('#imageClearEdit').show ();
                    }
                    break;
                case 'newTask':
                    $ ('#imageNew').hide ();
                    $ ('#imageNew').attr ('src', "");
                    imageData = null;
                    break;
            }

            //# attach
        } else if (attach === true) {
            switch (currentSection) {
                case 'editTask':
                    imageData = DrawSomething.getImageData ();
                    $ ('#imageEdit').show ();
                    $ ('#imageEdit').attr ('src', imageData);
                    $ ('#imageClearEdit').show ();
                    break;
                case 'newTask':
                    imageData = DrawSomething.getImageData ();
                    $ ('#imageNew').show ();
                    $ ('#imageNew').attr ('src', imageData);
                    $ ('#imageClearNew').show ();
                    break;
            }
        }
    };

    window.page = page;
}) ();