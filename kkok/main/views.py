from django.shortcuts import render

# Create your views here.
def productView(request, session, familyId):
  return render(request, "Prototype/index.html", {
    "is_test": "false",
    "family_id": familyId,
  })



def testView(request):
  return render(request, "Prototype/index.html", {
    "is_test": "true",
  })
