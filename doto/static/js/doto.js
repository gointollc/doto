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
        // Setup events
        $('#profile_form').submit(function(e) {
            e.preventDefault();
            console.log('saving profile...');
            doto.save_profile();
        });
        $('#add-class-button').click(function(e) {
            $('#add-task-form').toggleClass('hide');
        });
        /*$('.task-item .edit').click(function(e) {
            console.log('edit clicked!');
            $(this).parent().parent().children('.task-edit-form').removeClass('hide');

        });*/

        // reveal the interface
        this.display_profiles();
        this.display_profile_tasks(1);

        // utilities
        //$('.datepicker').datepicker();
    },
    display_profiles: function() {
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
                    html += '<a href="#" class="list-group-item task-item"><h3 class="list-group-item-heading">' + val['name'] + '</h4>';
                    html += '<p class="list-group-item-text bottom-15">' + val['details'] + '</p>';
                    html += '<p class="list-group-item-text options">';
                        html += '<button class="btn btn-default"><span class="glyphicon glyphicon-check text-right"></span> Done</button>';
                        html += '<button class="btn btn-default edit"><span class="glyphicon glyphicon-wrench text-right"></span> Edit</button>';
                    html += '</p>';
                    //html += '<form class="task-edit-form"><input type="hidden" name="task-id" value="' + val['task_id'] + '" /><input type="text" /><textarea name="task-details"></textarea></form>'
                    html += DotoTemplates.task_edit_form(val);
                    html += '<p class="list-group-item-text"><small>Added ' + val['added'] + '</small></p>';
                    html += '</a>';
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
        });
    },
    display_task_form: function() {

    },
    save_task: function(task_id = null, task_form = null) {
        if (task_id != null) {
            console.log('saving task_id=' + task_id);
            console.log(task_form);
            $.ajax("/task/", 
                {
                    'method': 'POST',
                    'data': task_form, 
                    'success': function( data ) {
                        console.log('saved task!');
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
                    }
                }
            );
        }
        return false;
    },
};