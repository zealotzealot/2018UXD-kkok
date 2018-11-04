from django.db import models

# Create your models here.


class Kkok(models.Model):
  session = models.IntegerField()
  time = models.DateTimeField(auto_now_add = True)
  familyId = models.IntegerField()

