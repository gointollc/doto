/* doto
 *
 * Copyright (c) Mike Shultz 2015
 */

var DotoTemplates = {
    task_edit_form: function(data) {
        html = '<form class="task-edit-form well hide">';
        html += '<input type="hidden" name="task-id" class="edit-task-id" value="' + data['task_id'] + '" />';
        html += '<input type="hidden" name="task-profile-id" value="' + data['profile'] + '" />';
        html += '<input type="hidden" name="csrfmiddlewaretoken" value="' + $.cookie('csrftoken') + '" />';
        html += '<div class="form-group"><label for="edit-task-name-' + data['task_id'] + '">Name</label><input type="text" class="form-control edit-task-name" id="edit-task-name" name="task-name" value="' + data['name'] + '" /></div>';
        html += '<div class="form-group"><label for="edit-details-' + data['task_id'] + '">Details</label><textarea id="edit-details-' + data['task_id'] + '" class="form-control edit-task-details" name="task-details">' + data['details'] + '</textarea></div>';
        html += '<div class="form-group"><label for="edit-deadline-' + data['task_id'] + '">Deadline</label><input type="text" id="edit-deadline-' + data['task_id'] + '" class="form-control edit-task-deadline" name="task-deadline" placeholder="YYYY-MM-DD" data-provide="datepicker" data-date-format="yyyy-mm-dd" value="' + data['deadline'] + '" /></div>';
        html += '<div class="form-group"><button type="submit" class="btn btn-default save-task-button"><span class="glyphicon glyphicon-save"></span> Save</button></div>';
        html += '</form>';
        return html;
    },
    add_profile_button: function() {
        return '<button class="btn btn-default navbar-btn noaction" onclick="$(\'#profile_form\').toggleClass(\'hide\'); return false;"><i class="glyphicon glyphicon-plus"></i> </button>';
    },
    add_task_button: function() {
        return '<button class="btn btn-default" id="add-task-button" data-toggle="modal" data-target="#add-task-modal"><span class="glyphicon glyphicon-plus"></span> Add Task</button>';
    }
}

var Doto = function() {};
Doto.prototype = {
    version: '0.0.1',
    profiles: false,
    currentProfileId: -1,
    setup: function() {
        this.start_loading();
        // Setup events
        $('#profile_form').submit(function(e) {
            e.preventDefault();
            console.log('saving profile...');
            doto.save_profile();
        });
        $('#add-task-button').click(function(e) {
            doto.save_task();
        });
        /*$('.task-item .edit').click(function(e) {
            console.log('edit clicked!');
            $(this).parent().parent().children('.task-edit-form').removeClass('hide');

        });*/

        // reveal the interface
        this.display_profiles();
        this.display_profile_tasks(1);

        this.stop_loading();

        // utilities
        //$('.datepicker').datepicker();
    },
    start_loading: function() {
        $('#loading-indicator').removeClass('hide');
        console.log('start loading');
    },
    stop_loading: function() {
        $('#loading-indicator').addClass('hide');
        console.log('done loading');
    },
    display_profiles: function() {
        this.start_loading();
        $.getJSON("/profile", function( data ) {
            if (data.status == 'error') {
                doto.profiles = false;
                $('#profile-tabs').html(DotoTemplates.add_profile_button());
                $('#message').html(data['message']).addClass('bg-danger').removeClass('hide');
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
                    //console.log('click!  profile_id = ' + e.currentTarget.data('profile-id'))
                    //console.log('click!  profile_id = ' + this.data('profile-id'));
                    //console.log($(this).data('profileId'));
                    doto.display_profile_tasks($(this).data('profileId'));
                    $('#profile-tabs button').removeClass('active');
                    $(this).addClass('active');
                });
            }
            doto.stop_loading();
        });
    },
    save_profile: function() {
        this.start_loading();
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
                    doto.stop_loading();
                }
            }
        );
        return false;
    },
    display_profile_tasks: function(profile_id) {
        this.start_loading();
        doto.currentProfileId = profile_id;
        $('#add-task-form #task-profile-id').val(profile_id);
        $.getJSON("/task/?profile_id=" + profile_id, function( data ) {
            if (data.status == 'error') {
                console.log(data['message']);
                $('#task-list').html('');
                $('#message').html(data['message']).removeClass('hide').addClass('bg-warning');
                $('#task-add-container').html(DotoTemplates.add_task_button()).removeClass('hide');
            } else {
                console.log(data);
                $('#message').addClass('hide');
                $('#task-add-container').html(DotoTemplates.add_task_button()).removeClass('hide');
                html = '';
                $.each(data['data'], function(idx, val) {

                    if(val['deadline'] === null) val['deadline'] = '';

                    html += '<div class="list-group-item task-item"><h3 class="list-group-item-heading">' + val['name'] + '</h4>';
                    html += '<p class="list-group-item-text bottom-15">' + val['details'] + '</p>';
                    html += '<p class="list-group-item-text options">';
                        html += '<button class="btn btn-default complete-task" data-task-id="' + val['task_id'] + '"><span class="glyphicon glyphicon-check text-right"></span> Done</button>';
                        html += '<button class="btn btn-default edit"><span class="glyphicon glyphicon-wrench text-right"></span> Edit</button>';
                    html += '</p>';
                    html += DotoTemplates.task_edit_form(val);
                    html += '<p class="list-group-item-text"><small>Added ' + val['added'] + '</small></p>';
                    html += '</div>';

                })
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
                doto.save_task($(this).children('input[name="task-id"]').val());
            })
            $('.save-task-button').click(function(e) {
                e.preventDefault();
                console.log('following should be the form serialized:');
                console.log($(this).parent().parent().serialize(true));
                doto.save_task($(this).parent().parent().children('.edit-task-id').val(), $(this).parent().parent().serialize(true));
            });
            $('.complete-task').click(function(e) {
                doto.complete_task($(this).data('taskId'));
            })
            doto.stop_loading();
        });
    },
    complete_task: function(task_id = null) {
        this.start_loading();
        if (task_id) {
            $.ajax("/task/complete/", 
                {
                    'method': 'POST',
                    'data': 'task-id=' + task_id + '&csrfmiddlewaretoken=' + $.cookie('csrftoken'), 
                    'success': function( data ) {
                        console.log('completed task!');
                        doto.stop_loading();
                    }
                }
            );
        } else {
            // TODO: display error to the user?  This really shouldn't happen.
            console.log('task_id is required to complete a task.');
        }

    },
    save_task: function(task_id = null, task_form = null) {
        if (task_id != null) {
            this.start_loading();
            console.log('saving task_id=' + task_id);
            console.log(task_form);
            $.ajax("/task/", 
                {
                    'method': 'POST',
                    'data': task_form, 
                    'success': function( data ) {
                        console.log('saved task!');
                        doto.stop_loading();
                    }
                }
            );
        } else {
            console.log('adding new task...');
            $.ajax("/task/", 
                {
                    'method': 'POST',
                    'data': $('#add-task-form').serialize(true), 
                    'success': function( data ) {
                        console.log('saved task!');
                        $('#add-task-modal').modal('hide');
                    }
                }
            );
        }
        doto.display_profile_tasks(doto.currentProfileId);
        return false;
    },
};