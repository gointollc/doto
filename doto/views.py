from doto.models import Profile, Task
from doto.mixins import JSONResponseMixin
from django.core.exceptions import ValidationError
from django.views.generic import View

#class TaskView(JSONResponseMixin, TemplateView):
#    def render_to_response(self, context, **response_kwargs):
#        return self.render_to_json_response(context, **response_kwargs)

class ProfileView(JSONResponseMixin, View):
    model = Profile
    http_method_names = ['get', 'post']

    def get(self, request, *args, **kwargs):
        """ Display profiles """
        if kwargs.get('profile_id'):
            objs = Profile.objects.filter(profile_id = kwargs.get('profile_id'))
        else:
            objs = Profile.objects.all()
        return self.render_to_json_response({'objects': objs, })

    def post(self, request, *args, **kwargs):
        """ Save a profile """
        print('args: %s', args)
        print('kwargs: %s', kwargs)
        print('POST: %s', request.POST)
        if not request.POST.get('name') or not request.POST.get('email'):
            raise ValidationError('Name and E-mail required.')
        elif request.POST.get('profile_id'):
            p = Profile.objects.get(profile_id = request.POST.get('profile_id'))
            p.name = request.POST.get('name')
            p.email = request.POST.get('email')
            p.save()
            return self.render_to_json_response({})
        else:
            p = Profile(
                name = request.POST.get('name'),
                email = request.POST.get('email')
            )
            p.save()
            return self.render_to_json_response({})

class TaskView(JSONResponseMixin, View):
    model = Task
    http_method_names = ['get', 'post']

    def get(self, request, *args, **kwargs):
        """ Display tasks """
        if kwargs.get('task_id'):
            objs = Task.objects.filter(task_id = kwargs.get('task_id'))
        elif request.GET.get('profile_id'):
            print('filtering by profile_id! ', request.GET.get('profile_id'))
            objs = Task.objects.filter(profile_id = request.GET.get('profile_id'))
        else:
            objs = Task.objects.all()
        return self.render_to_json_response({'objects': objs, })

