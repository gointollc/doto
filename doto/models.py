from datetime import datetime

import tagging
from django.db import models
from django.contrib.auth.models import User
from doto.utils import datetime_to_iso

class ModelDict(object):
    """ A fake model to keep errors from happening...
        TODO: Is this really the best way to handle this?
    """

    def __init__(self, **kwargs):
        for k,v in kwargs.items():
            setattr(self, k, v) 

    def to_object(self):
        obj = {}
        for attr in dir(self):
            if not attr.startswith('_') and not attr == 'to_object':
                if (type(getattr(self, attr)) == bytes):
                    obj[attr] = getattr(self, attr).decode('utf-8')
                else:
                    obj[attr] = getattr(self, attr)
                
        print("dict: %s" % obj)
        return obj

class LoginResponse(ModelDict):
    token = bytes()
    user_id = int()
    expire = str()

class Profile(models.Model):
    profile_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    def __str__(self):
        return self.name
    def to_object(self):
        return {
            'profile_id': self.profile_id,
            'name': self.name,
            'email': self.email,
        }

class ProfilePermissions(models.Model):
    profile_permissions_id = models.AutoField(primary_key=True)
    profile = models.ForeignKey(Profile, related_name="profile_permissions")
    user = models.ForeignKey(User)
    read = models.BooleanField(default=True)
    write = models.BooleanField(default=False)
    def __str__(self):
        return "Permissions for profile #" + str(self.profile_id) + " for user #" + str(self.user_id)
    def to_object(self):
        return {
            'profile_id': self.profile_id,
            'user_id': self.user_id,
            'read': self.read,
            'write': self.write,
        }

class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    details = models.CharField(max_length=255)
    deadline = models.DateField(null=True)
    complete = models.BooleanField(default=False)
    profile = models.ForeignKey(Profile)
    added = models.DateField(auto_now_add = True)
    def __str__(self):
        return self.name
    def to_object(self):
        return {
            'task_id': self.task_id,
            'name': self.name,
            'details': self.details,
            'deadline': datetime_to_iso(self.deadline),
            'complete': self.complete,
            'profile': self.profile_id,
            'added': datetime_to_iso(self.added),
        }
tagging.register(Task)