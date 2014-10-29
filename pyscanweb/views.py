from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.shortcuts import render
from django.core.urlresolvers import reverse

from pyinsanehelper.scanner import Scanner
import pyinsane.src.abstract as pyinsane

import pprint
import json
import tempfile
from session import *


def scanpage(request):
    "Show the main scanning page"
    template = loader.get_template('index.html')
    context = RequestContext(request, {
        'test': 'bonjour',
    })
    return HttpResponse(template.render(context))


def json_scaners_list(request):
    "Return the scanners list and configuration in json format"
    scannerManager = Scanner()
    list_of_scanners = scannerManager.getScannerList()

    return HttpResponse(json.dumps(list_of_scanners), content_type="application/json")


def json_launch_scanner(request):
    "Start the scanner and return a json response to update the web page"
    image_result = {}
    try:
        if request.method != 'POST':
            raise Exception('No post data')
        device = pyinsane.Scanner(name=request.POST.get("scanner"))
        device.options['mode'].value = request.POST.get("mode")
        device.options['resolution'].value = int(request.POST.get("resolution"))
        
    except Exception, e:
        return HttpResponse(json.dumps({'error' : 'Invalid post data'}), content_type="application/json")

    scan_session = device.scan(multiple=False)
    scan_success = False

    try:
        while True:
            scan_session.scan.read()
            scan_success = True
    except EOFError:
        if not scan_success :
            return HttpResponse(json.dumps({'error' : 'Unable to scan document'}), content_type="application/json")

    # Init the session manager
    sessionManager = SessionScanedImagesManager(request)
    try:
        for image in scan_session.images :
            tf = tempfile.NamedTemporaryFile(prefix="pyscanweb_")
            image.save(tf.name + ".jpg", 'JPEG')
            sessionManager.session_add_image(tf.name + ".jpg")
    except Exception, e:
        return HttpResponse(json.dumps({'error' : "Returned error : %s" % (str(e))}), content_type="application/json")
    
    sessionManager.get_session_images_list()

    linksList = [];
    linksList.append(reverse('last_scanned_image'))

    return HttpResponse(json.dumps({'error' : False, 'links' : linksList}), content_type="application/json")


def get_last_scanned_image(request):
    "Show the last scanned image"
    sessionManager = SessionScanedImagesManager(request)
    image_target = sessionManager.get_last_image()
    try:
        with open(image_target, "rb") as f:
            return HttpResponse(f.read(), content_type="image/jpeg")
    except IOError:
        return HttpResponseNotFound('<h1>Page not found</h1>')