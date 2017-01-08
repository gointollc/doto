/* doto
 *
 * Copyright (c) Mike Shultz 2015
 */

var DotoTemplates = {
    task_edit_form: function(data) {
        html = '<form class="task-edit-form well hide">';
        html += '<input type="hidden" name="task-id" class="edit-task-id" value="' + data['task_id'] + '" />';
        html += '<input type="hidden" name="profile-id" value="' + data['profile'] + '" />';
        html += '<input type="hidden" name="csrfmiddlewaretoken" value="' + $.cookie('csrftoken') + '" />';
        html += '<div class="form-group"><label for="edit-task-name-' + data['task_id'] + '">Name</label><input type="text" class="form-control edit-task-name" id="edit-task-name" name="name" value="' + data['name'] + '" /></div>';
        html += '<div class="form-group"><label for="edit-details-' + data['task_id'] + '">Details</label><textarea id="edit-details-' + data['task_id'] + '" class="form-control edit-task-details" name="details">' + data['details'] + '</textarea></div>';
        html += '<div class="form-group"><label for="edit-deadline-' + data['task_id'] + '">Deadline</label><input type="text" id="edit-deadline-' + data['task_id'] + '" class="form-control edit-task-deadline" name="deadline" placeholder="YYYY-MM-DD" data-provide="datepicker" data-date-format="yyyy-mm-dd" value="' + data['deadline'] + '" /></div>';
        html += '<div class="form-group"><button type="submit" class="btn btn-default save-task-button"><span class="glyphicon glyphicon-save"></span> Save</button></div>';
        html += '</form>';
        return html;
    },
    login_button: function () {
        return '<button class="btn btn-default navbar-btn noaction" onclick="$(\'#login_form\').toggleClass(\'hide\'); return false;"><i class="glyphicon glyphicon-user"></i> </button>';
    },
    add_profile_button: function() {
        return '<button class="btn btn-default navbar-btn noaction" onclick="$(\'#profile_form\').toggleClass(\'hide\'); return false;"><i class="glyphicon glyphicon-plus"></i> </button>';
    },
    add_task_button: function() {
        return '<button class="btn btn-default" id="add-task-button" data-toggle="modal" data-target="#add-task-modal"><span class="glyphicon glyphicon-plus"></span> Add Task</button>';
    },
    alert: function() {
        return '<p id="message" class="alert alert-info fade in"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="message-text"></span></p>';
    }
}

var Doto = function() {};
Doto.prototype = {
    version: '0.0.1',
    profiles: false,
    currentProfileId: sessionStorage.getItem('currentProfileId') || -1,
    user_id: sessionStorage.getItem('doto_user_id'),
    auth_expiration: sessionStorage.getItem('doto_auth_expiration'),
    token: sessionStorage.getItem('doto_token'),
    setup: function() {
        // Setup events
        $('#add-task-modal .save').click(function(e) {
            //e.preventDefault();
            //$('#add-task-form #task-profile-id').val(doto.currentProfileId);
            console.log('saving new task...');
            doto.save_task({'task_form': $('#add-task-form').serialize(true)});
            // TODO: check for sucess?
            $('#add-task-modal').modal('hide');
        });
        $('#profile_form').submit(function(e) {
            e.preventDefault();
            console.log('saving profile...');
            doto.save_profile();
        });
        $('#login_form').submit(function(e) {
            e.preventDefault();
            console.log('loggin in...');
            doto.login($('#username').val(), $('#password').val());
        });
        $('#add-class-button').click(function(e) {
            $('#add-task-form').toggleClass('hide');
        });

        // handle events
        $('#add-task-modal').on('shown.bs.modal', function() {
            $('#task-name').focus();
        })
        /*$('.task-item .edit').click(function(e) {
            console.log('edit clicked!');
            $(this).parent().parent().children('.task-edit-form').removeClass('hide');

        });*/

        // ajax settings
        if (this.token) {
            $.ajaxSetup({headers: {"Authorization": "Basic " + this.token}})
        }
            
        // reveal the interface
        //this.display_profiles();
        //this.display_profile_tasks(1);
        if (this.user_id && this.auth_expiration > Date.now()) {
            this.display_profiles();
            this.display_profile_tasks(1);
        }
        else {
            this.display_login();
        }

        // utilities
        //$('.datepicker').datepicker();
    },
    display_login: function() {
        $('#profile-tabs').html(DotoTemplates.login_button());
    },
    display_promo: function() {
        $('#promo').removeClass('hide');
    },
    display_profiles: function() {
        $.getJSON("/profile", function( data ) {
            if (data.status == false) {
                doto.profiles = false;
                $('#profile-tabs').html(DotoTemplates.add_profile_button());

                var new_alert = $(DotoTemplates.alert());
                $('#notify').prepend(new_alert);
                new_alert.children('.message-text').html(data['message'])
                new_alert.delay(3000).slideUp(200, function() {
                        $(this).alert('close');
                    });
                new_alert.alert();

            } else {
                doto.profiles = true;
                html = ''; 
                $.each(data['data'], function(idx, val) {
                    html += '<button type="button" class="btn btn-default navbar-btn" data-profile-id="' + val.profile_id + '">' + val.name + '</button>'
                });
                html = html + DotoTemplates.add_profile_button();
                $('#profile-tabs').html(html);

                // Add click event to tabs
                $('#profile-tabs button').not('.noaction').click(function(e) {
                    e.preventDefault();
                    doto.display_profile_tasks($(this).data('profileId'));
                    $('#profile-tabs button').removeClass('active');
                    $(this).addClass('active');
                });
            }
        });
    },
    save_profile: function() {
        $.ajax("/profile/", 
            {
                'method': 'POST',
                'data': $('#profile_form').serialize(true), 
                'success': function( data ) {
                    $('#profile_form input').val('');
                    $('#profile_form').addClass('hide');
                    doto.display_profiles();
                    if (doto.profiles) {
                        doto.display_profile_tasks(1);
                    }
                }
            }
        );
        return false;
    },
    display_profile_tasks: function(profile_id) {

        // get rid of the promo
        $('#promo').addClass('hide');

        // Deal with new profile_id
        doto.currentProfileId = profile_id;
        sessionStorage.setItem('currentProfileId', profile_id);

        $('#add-task-form #task-profile-id').val(profile_id);

        $.getJSON("/task/?profile_id=" + profile_id, function( data ) {
                
            $('#task-add-container').html(DotoTemplates.add_task_button()).removeClass('hide');

            if (data.status == false) {
                
                console.warn(data['message']);
                
                var new_alert = $(DotoTemplates.alert());
                $('#notify').prepend(new_alert);
                new_alert.children('.message-text').html(data['message']);
                new_alert.delay(3000).slideUp(200, function() {
                        $(this).alert('close');
                    });
                new_alert.alert();

            } else {
                html = '';
                if (data['data']) {
                    $.each(data['data'], function(idx, val) {
                        var colorMod;
                        if (val['deadline']) {
                            var diff = (Date.parse(val['deadline']) - Date.now()) * 0.001; // milliseconds to seconds
                            // past
                            if (diff < 0)
                                colorMod = 'task-late';
                            // or less than a week away
                            else if (diff < 604800)
                                colorMod = 'task-soon';
                        }
                        html += '<a href="#" class="list-group-item task-item ' + colorMod + '"><h3 class="list-group-item-heading">' + val['name'] + '</h4>';
                        html += '<p class="list-group-item-text bottom-15">' + val['details'] + '</p>';
                        html += '<p class="list-group-item-text options">';
                            html += '<button class="btn btn-default complete-task" data-task-id="' + val['task_id'] + '"><span class="glyphicon glyphicon-check text-right"></span> Done</button>';
                            html += '<button class="btn btn-default edit"><span class="glyphicon glyphicon-wrench text-right"></span> Edit</button>';
                        html += '</p>';
                        //html += '<form class="task-edit-form"><input type="hidden" name="task-id" value="' + val['task_id'] + '" /><input type="text" /><textarea name="task-details"></textarea></form>'
                        html += DotoTemplates.task_edit_form(val);
                        html += '<p class="list-group-item-text"><small>Added ' + val['added'] + '</small></p>';
                        if (val['deadline']) 
                            html += '<p class="list-group-item-text"><small> to do before <span class="deadline">' + val['deadline'] + '</span></small></p>';
                        html += '</a>';
                    });
                }
                //html += '';
                $('#profile-detail').html(html);
                $('#profile-detail').removeClass('hide');
            }

            // events for this list
            $('.task-item .edit').click(function(e) {
                $(this).parent().parent().children('.task-edit-form').toggleClass('hide');
            });
            $('.task-edit-form').submit(function(e) {
                e.preventDefault();
                doto.save_task({'task_id': $(this).children('input[name="task-id"]').val(), 'task_form': $(this).parent().parent().serialize(true)});
            })
            $('.save-task-button').click(function(e) {
                e.preventDefault();
                doto.save_task({'task_id': $(this).parent().parent().children('.edit-task-id').val(), 'task_form': $(this).parent().parent().serialize(true)});
            });
            $('.complete-task').click(function(e) {
                doto.complete_task($(this).data('taskId'));
            })
        });
    },
    complete_task: function(task_id = null) {
        if (task_id) {
            $.ajax("/task/complete/", 
                {
                    'method': 'POST',
                    'data': 'task-id=' + task_id + '&csrfmiddlewaretoken=' + $.cookie('csrftoken'), 
                    'success': function( data ) {
                        console.log('completed task!');
                        doto.display_profile_tasks(doto.currentProfileId);
                    }
                }
            );
        } else {
            // TODO: display error to the user?  This really shouldn't happen.
            console.log('task_id is required to complete a task.');
        }

    },
    save_task: function(args) {
        if (!args) args = {};

        if (args.task_id != null || args.task_form != null) {
            console.log('saving task_id=' + args.task_id);
            $.ajax("/task/", 
                {
                    'method': 'POST',
                    'data': args.task_form, 
                    'success': function( data ) {
                        console.log('saved task!');
                        // refresh
                        doto.display_profile_tasks(doto.currentProfileId);
                    }
                }
            );
        } else {
            $.ajax("/task/", 
                {
                    'method': 'POST',
                    'data': $('#add-task-form').serialize(true), 
                    'success': function( data ) {
                        console.log('saved task!');
                        // refresh
                        doto.display_profile_tasks(doto.currentProfileId);
                    }
                }
            );
        }
        return false;
    },
    login: function(username, password) {
        $.ajax("/login/", 
            {
                'method': 'POST',
                'data': {'csrfmiddlewaretoken': $.cookie('csrftoken'), 'username': username, 'password': password}, 
                'success': function( data ) {
                    console.log('logged in!');

                    // From now on, we want to use this token for auth
                    doto.token = data.data[0].token;
                    $.ajaxSetup({headers: {"Authorization": "Basic " + data.data[0].token}});

                    // refresh
                    $('#login_form').addClass('hide');
                    doto.display_profiles();
                    doto.display_profile_tasks(data.data[0].user_id);
                    doto.auth_expiration = Date.parse(data.data[0].expire);

                    // store
                    sessionStorage.setItem('doto_user_id', data.data[0].user_id);
                    sessionStorage.setItem('doto_auth_expiration', Date.parse(data.data[0].expire));
                    sessionStorage.setItem('doto_token', data.data[0].token);
                },
                'error': function(xhr, status, error) {
                    if (xhr.status === 401) {
                        console.error("Authentication failed!");
                        var new_alert = $(DotoTemplates.alert());
                        $('#notify').prepend(new_alert);
                        new_alert.children('.message-text').html("Authentication failed!");
                        new_alert.removeClass('alert-info')
                            .addClass('alert-danger')
                            .delay(5000).slideUp(200, function() {
                                $(this).alert('close');
                            });
                        new_alert.alert();
                    }
                    else {
                        console.error("Unknown authentication failure.");
                        var new_alert = $(DotoTemplates.alert());
                        new_alert.children('.message-text').html("Unknown authentication failure.");
                        new_alert.removeClass('alert-info')
                            .addClass('alert-danger')
                            .delay(5000).slideUp(200, function() {
                                $(this).alert('close');
                            });
                        new_alert.alert();
                        $('#notify').prepend(new_alert);
                    }
                }
            }
        );
    },
};