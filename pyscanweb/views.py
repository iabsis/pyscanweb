from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotFound
from django.template import RequestContext, loader
from django.shortcuts import render
from django.core.urlresolvers import reverse

import fpdf
from os import remove
from pyinsanehelper.scanner import Scanner
import sane
import sys

import pprint
import json
import tempfile
from session import *


def scanpage(request):
    "Show the main scanning page"
    sessionManager = SessionScanedImagesManager(request)
    sessionManager.clear()
    template = loader.get_template('index.html')
    context = RequestContext(request, {})
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
        device_name = request.POST.get("scanner")
        device_mode = request.POST.get("mode")
        device_resolution = int(request.POST.get("resolution"))
        device_source = request.POST.get("source")
        multipage = bool(int(request.POST.get("multipage")))
        
    except Exception, e:
        return HttpResponse(json.dumps({'error' : 'Invalid post data'}), content_type="application/json")

    try:
        sane.init()
        scanner = sane.open(device_name)
        scanner.resolution = device_resolution
        scanner.source = str(device_source)
        scanner.mode = str(device_mode)
    except:
        return HttpResponse(json.dumps({'error' : 'Unable to initialize the scanner'}), content_type="application/json")


    sessionManager = SessionScanedImagesManager(request)
    nb_images = 0
    try:
        while True:
            image = scanner.scan()
            tf = tempfile.NamedTemporaryFile(prefix="pyscanweb_")
            image.save(tf.name + ".jpg", 'JPEG')
            sessionManager.session_add_image(tf.name + ".jpg")
            nb_images += 1
            print nb_images
            if not multipage:
                break;
    except:
        pprint.pprint(sys.exc_info())
        if nb_images == 0:
            return HttpResponse(json.dumps({'error' : 'Unable to scan documents'}), content_type="application/json")
    finally:
        scanner.close()

    linksList = [];
    images_list = sessionManager.get_session_images_list()
    total_image_count = len(images_list)
    print nb_images
    for i in range(total_image_count-nb_images, total_image_count):
        print i, reverse('get_scanned_image_id', kwargs={'id': i })
        linksList.append({ 
            'url' : reverse('get_scanned_image_id', kwargs={'id': i }), 
            'id' : i 
        })
    
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


def generate_pdf(request):
    images_list = request.POST.getlist("images_list")
    sessionManager = SessionScanedImagesManager(request)

    pdf_filename = tempfile.NamedTemporaryFile(prefix="pyscanweb_pdf_").name + ".pdf"
    f = fpdf.FPDF()
    

    for image in images_list:
        sessionImage = sessionManager.get_image(int(image))
        f.add_page()
        f.image(sessionImage, x=0, y=0, w=210, h=0)


    f.output(name=pdf_filename, dest='F')

    try:
        with open(pdf_filename, "rb") as f:
            response = HttpResponse(f.read(), content_type="application/force-download")
            response['Content-Disposition'] = 'attachment; filename="%s"' % "merged_files.pdf"
            remove(pdf_filename)
            return response
    except IOError:
        return HttpResponseNotFound('<h1>Image not found</h1>')
    
