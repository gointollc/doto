# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('profile_id', models.AutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('task_id', models.AutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('details', models.CharField(max_length=255)),
                ('deadline', models.DateField(blank=True)),
                ('complete', models.BooleanField(default=False)),
                ('added', models.DateField(auto_now_add=True)),
                ('profile', models.ForeignKey(to='doto.Profile')),
            ],
        ),
    ]
