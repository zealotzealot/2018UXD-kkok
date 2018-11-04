from django.shortcuts import render
from . import models
import datetime

# Create your views here.
def productView(request, sessionId, familyId):
  baseTime = datetime.datetime(2000, 1, 1, 0, 0)
  kkoks = [{
    "family_id": k.familyId,
    "time": int((k.time.timestamp() - baseTime.timestamp()) * 1000)
  } for k in models.Kkok.objects.filter(sessionId=sessionId)]

  return render(request, "Prototype/index.html", {
    "is_test": "false",
    "family_id": familyId,
    "kkoks": kkoks,
  })



def testView(request):
  return render(request, "Prototype/index.html", {
    "is_test": "true",
  })
