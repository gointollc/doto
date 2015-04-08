from datetime import datetime

import tagging
from django.db import models
from doto.utils import datetime_to_iso

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