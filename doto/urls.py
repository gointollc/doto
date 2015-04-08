from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from doto.views import ProfileView, TaskView

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^profile/(?P<profile_id>[0-9]*)$', ProfileView.as_view(), name='profile'),
    url(r'^task/(?P<task_id>[0-9]*)$', TaskView.as_view(), name='task'),

    url(r'^$', TemplateView.as_view(template_name = "index.html")),

    # Examples:
    # url(r'^$', 'doto.views.home', name='home'),
    # url(r'^doto/', include('doto.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
