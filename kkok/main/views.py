from django.shortcuts import render

# Create your views here.
def productView(request):
  return render(request, "Prototype/index.html", {})