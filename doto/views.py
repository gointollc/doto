import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.core.exceptions import ValidationError
from django.views.generic import View
from django.contrib.auth import authenticate

from doto.models import LoginResponse, Profile, ProfilePermissions, Task
from doto.utils import JSONResponseMixin, datetime_to_iso, response_unauthorized

class AuthenticationError(Exception): pass

class ProfileView(JSONResponseMixin, View):
    model = Profile
    http_method_names = ['get', 'post']

    def get(self, request, *args, **kwargs):
        """ Display profiles """

        if not request.is_authenticated: return response_unauthorized(status = 403)

        if kwargs.get('profile_id'):
            objs = Profile.objects.filter(profile_id = kwargs.get('profile_id'), profile_permissions__user_id=request.token_user.user_id, profile_permissions__read=True)
        else:
            objs = Profile.objects.filter(profile_permissions__user_id=request.token_user.user_id, profile_permissions__read=True)
        return self.render_to_json_response({'object_name': 'profile', 'objects': objs, })

    def post(self, request, *args, **kwargs):
        """ Save a profile """

        if not request.is_authenticated: return response_unauthorized(status = 403)

        pp = None

        if not request.POST.get('name') or not request.POST.get('email'):
            return self.render_to_json_response({ 'status': False, 'message': 'Name and E-mail required.', 'objects': []}, status = 400)
        elif request.POST.get('profile_id'):
            p = Profile.objects.get(profile_id = request.POST.get('profile_id'))
            p.name = request.POST.get('name')
            p.email = request.POST.get('email')
            p.save()
        else:
            p = Profile(
                name = request.POST.get('name'),
                email = request.POST.get('email')
            )
            p.save()
            pp = ProfilePermissions(
                profile_id = p.profile_id,
                user_id = request.token_user.user_id
            )
            pp.save()
        return self.render_to_json_response({'status': True, 'message': "Profile added"})

class TaskView(JSONResponseMixin, View):
    model = Task
    http_method_names = ['get', 'post']

    def get(self, request, *args, **kwargs):
        """ Display tasks """

        if not request.is_authenticated: return response_unauthorized(status = 403)

        if kwargs.get('task_id'):
            objs = Task.objects.filter(task_id = kwargs.get('task_id'), complete = False, profile__profile_permissions__user_id=request.token_user.user_id, profile__profile_permissions__read=True)
        elif request.GET.get('profile_id'):
            objs = Task.objects.filter(profile_id = request.GET.get('profile_id'), complete = False, profile__profile_permissions__user_id=request.token_user.user_id, profile__profile_permissions__read=True)
        else:
            objs = Task.objects.filter(complete = False, profile__profile_permissions__user_id=request.token_user.user_id, profile__profile_permissions__read=True)
        return self.render_to_json_response({'object_name': 'task', 'objects': objs, })

    def post(self, request, *args, **kwargs):
        """ Save a task """

        if not request.is_authenticated: return response_unauthorized(status = 403)

        if not request.POST.get('profile-id'):
            return self.render_to_json_response({ 'message': 'Profile not selected.  This should not happen.'}, status = 400)
        elif not request.POST.get('name'):
            return self.render_to_json_response({ 'message': 'Task name is required.'}, status = 400)
        elif request.POST.get('task-id'):
            p = Profile.objects.get(profile_id = int(request.POST.get('profile-id')))
            t = Task.objects.get(task_id = request.POST.get('task-id'))
            t.name = request.POST.get('name')
            t.details = request.POST.get('details')
            t.deadline = datetime_to_iso(request.POST.get('deadline'))
            t.profile = p
        else:
            p = Profile.objects.get(profile_id = request.POST.get('profile-id'))
            t = Task(
                name = request.POST.get('name'),
                details = request.POST.get('details'),
                deadline = datetime_to_iso(request.POST.get('deadline')),
                profile = p,
            )
        t.save()
        return self.render_to_json_response({'status': True, 'message': "Task saved"})

class TaskCompleteView(JSONResponseMixin, View):
    model = Task
    http_method_names = ['post', ]

    def post(self, request, *args, **kwargs):
        """ Complete a task """

        if not request.is_authenticated: return response_unauthorized(status = 403)

        if not request.POST.get('task-id'):
            return self.render_to_json_response({ 'status': False, 'message': 'task-id is required.'}, status = 400)
        else:
            t = Task.objects.get(task_id = request.POST.get('task-id'), profile__profile_permissions__user_id=request.token_user.user_id, profile__profile_permissions__read=True)
            if t:
                t.complete = True
                t.save()
                return self.render_to_json_response({'status': True, 'message': "Task completed", 'objects': []})
            else:
                return self.render_to_json_response({'status': False, 'message': "Task not found", 'objects': []}, status = 404)

class LoginView(JSONResponseMixin, View):
    http_method_names = ['post', ]

    def post(self, request, *args, **kwargs):
        """ Log a user in and give them a JWT """
        u = request.POST.get('username')
        p = request.POST.get('password')
        
        if not u and not p:
            return self.render_to_json_response({ 'status': False, 'message': 'username and password must both be provided.', 'objects': []}, status = 400)
        else:
            user = authenticate(username=u, password=p)
            if not user:
                return self.render_to_json_response({ 'status': False, 'message': "Authentication failed", 'objects': []}, status = 401)
            else:

                # expiration
                expiry = datetime.utcnow() + timedelta(hours=12)

                # create the token
                token = jwt.encode({
                    'user_id': user.id,
                    'username': user.username, 
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'exp': expiry,
                }, settings.SECRET_KEY, algorithm='HS256')

                obj = LoginResponse(token = token, user_id = user.id, expire = expiry.isoformat())

                return self.render_to_json_response( {'objects': [ obj ] } )
