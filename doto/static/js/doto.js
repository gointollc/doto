/* doto
 *
 * Copyright (c) Mike Shultz 2015
 */

var DotoTemplates = {
    'task_edit_form': function(data) {
        html = '<form class="task-edit-form well hide">';
        html += '<input type="hidden" name="task-id" value="' + data['task_id'] + '" />';
        html += '<div class="form-group"><label for="edit-task-id-' + data['task_id'] + '">Name</label><input type="text" class="form-control" id="edit-task-id-' + data['task_id'] + '" name="name" value="' + data['name'] + '" /></div>';
        html += '<div class="form-group"><label for="edit-details-' + data['task_id'] + '">Details</label><textarea id="edit-details-' + data['task_id'] + '" class="form-control" name="task-details">' + data['details'] + '</textarea></div>';
        html += '<div class="form-group"><label for="edit-deadline-' + data['task_id'] + '">Deadline</label><input type="text" id="edit-deadline-' + data['task_id'] + '" class="form-control" name="deadline" data-provide="datepicker" data-date-format="yyyy-mm-dd" value="' + data['deadline'] + '" /></div>';
        html += '<div class="form-group"><button type="submit" class="btn btn-default"><span class="glyphicon glyphicon-save"></span> Save</button></div>';
        html += '</form>';
        return html;
    }
}

var Doto = function() {};
Doto.prototype = {
    version: '0.0.1',
    setup: function() {
        // Setup events
        $('#profile_form').submit(function(e) {
            e.preventDefault();
            console.log('saving profile...');
            doto.save_profile();
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
                $('#prof_f_container').removeClass('hide');
            } else {
                html = ''; 
                $.each(data['data'], function(idx, val) {
                    //<li class="navbar-btn profile">
                    //html = html + '<button class="btn btn-default navbar-btn" data-profile-id="' + val.profile_id + '">' + val.name + '</button>';
                    html += '<button type="button" class="btn btn-default navbar-btn" data-profile-id="' + val.profile_id + '">' + val.name + '</button>'
                });
                html = html + '<button class="btn btn-default navbar-btn noaction" onclick="$(\'#profile_form\').toggleClass(\'hide\'); return false;"><i class="glyphicon glyphicon-plus"></i> </button>';
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
                    console.log('saved profile!');
                }
            }
        );
        $('#profile_form input').val('');
        $('#profile_form').addClass('hide');
        this.display_profiles();
        return false;
    },
    display_profile_tasks: function(profile_id) {
        $.getJSON("/task/?profile_id=" + profile_id, function( data ) {
            if (data.status == 'error') {
                console.log(data['message']);
                $('#task-list').html('');
                $('#profile-top .message').removeClass('hide').addClass('bg-warning').html(data['message']);
            } else {
                console.log(data);
                $('#profile-top .message').addClass('hide');
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
        });
    },
    save_task: function(task_id = null) {
        if (task_id != null) {
            console.log('saving task_id=' + task_id);
            /*
            $.ajax("/profile/", 
                {
                    'method': 'POST',
                    'data': $('#profile_form').serialize(true), 
                    'success': function( data ) {
                        console.log('saved profile!');
                    }
                }
            );
            $('#profile_form input').val('');
            $('#profile_form').addClass('hide');
            this.display_profiles();*/ 
        } else {
            console.log('adding new task!');
        }
        return false;
    },
};