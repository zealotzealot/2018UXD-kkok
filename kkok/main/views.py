from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
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
    "session_id": sessionId,
    "family_id": familyId,
    "kkoks": kkoks,
  })



def testView(request):
  return render(request, "Prototype/index.html", {
    "is_test": "true",
  })



@csrf_exempt
@require_http_methods(["POST"])
def createKkokView(request):
  baseTime = datetime.datetime(2000, 1, 1, 0, 0)

  sessionId = request.POST["session_id"]
  familyId = request.POST["family_id"]
  time = baseTime + datetime.timedelta(milliseconds=float(request.POST["time"]))

  models.Kkok.objects.create(sessionId=sessionId, familyId=familyId, time=time)

  return JsonResponse({})
