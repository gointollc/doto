# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('doto', '0002_auto_20150406_2248'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProfilePermissions',
            fields=[
                ('profile_permissions_id', models.AutoField(primary_key=True, serialize=False)),
                ('read', models.BooleanField(default=True)),
                ('write', models.BooleanField(default=False)),
                ('profile', models.ForeignKey(to='doto.Profile')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
