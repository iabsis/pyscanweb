from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.shortcuts import render


def scanpage(request):
    template = loader.get_template('index.html')
    context = RequestContext(request, {
        'test': 'bonjour',
    })
    return HttpResponse(template.render(context))
