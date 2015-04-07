from datetime import datetime

import tagging
from django.db import models

class Profile(models.Model):
    profile_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()

class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    details = models.CharField(max_length=255)
    deadline = models.DateField(blank=True)
    complete = models.BooleanField(default=False)
    profile = models.ForeignKey(Profile)
    added = models.DateField(auto_now_add = True)
tagging.register(Task)