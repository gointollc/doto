# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('doto', '0003_profilepermissions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilepermissions',
            name='profile',
            field=models.ForeignKey(related_name='profile_permissions', to='doto.Profile'),
        ),
    ]
