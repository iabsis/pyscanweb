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
    sessionManager = SessionScanedImagesManager(request)
    sessionManager.clear()
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
        device.options['source'].value = request.POST.get("source")
        multipage = bool(int(request.POST.get("multipage")))
        
    except Exception, e:
        return HttpResponse(json.dumps({'error' : 'Invalid post data'}), content_type="application/json")
    scan_session = device.scan(multiple=multipage)
    scan_success = False

    if not multipage:
        try:
            while True:
                scan_session.scan.read()
                scan_success = True
        except EOFError:
            if not scan_success :
                return HttpResponse(json.dumps({'error' : 'Unable to scan document'}), content_type="application/json")
    else :
        try:
            while True:
                try:
                    scan_session.scan.read()
                    scan_success = True
                except EOFError:
                    pass
        except StopIteration:
                  % len(scan_session.images))
            if not scan_success :
                return HttpResponse(json.dumps({'error' : 'Unable to scan document'}), content_type="application/json")

    # Init the session manager
    sessionManager = SessionScanedImagesManager(request)
    try:
        nb_images = 0
        for image in scan_session.images :
            tf = tempfile.NamedTemporaryFile(prefix="pyscanweb_")
            image.save(tf.name + ".jpg", 'JPEG')
            sessionManager.session_add_image(tf.name + ".jpg")
            nb_images+=1
    except Exception, e:
        return HttpResponse(json.dumps({'error' : "Returned error : %s" % (str(e))}), content_type="application/json")
    

    linksList = [];
    images_list = sessionManager.get_session_images_list()
    total_image_count = len(images_list)

    for i in range(total_image_count-nb_images-1, total_image_count-1):
        linksList.append(reverse('get_scanned_image_id', kwargs={'id': i }))

    return HttpResponse(json.dumps({'error' : False, 'links' : linksList}), content_type="application/json")


def get_last_scanned_image(request):
    "Show the last scanned image"
    sessionManager = SessionScanedImagesManager(request)

    
    try:
        image_target = sessionManager.get_last_image()
        with open(image_target, "rb") as f:
            return HttpResponse(f.read(), content_type="image/jpeg")
    except IOError:
        return HttpResponseNotFound('<h1>Image not found</h1>')


def get_session_image_id(request, id):
    sessionManager = SessionScanedImagesManager(request)
    try:
        image_target = sessionManager.get_image(int(id))
        with open(image_target, "rb") as f:
            return HttpResponse(f.read(), content_type="image/jpeg")
    except:
        return HttpResponseNotFound('<h1>Image not found</h1>')

