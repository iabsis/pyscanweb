from django.conf.urls import patterns, include, url
from django.contrib import admin
import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'pyscanweb.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'json/scanners_list$', views.json_scaners_list, name="json_scanners_list"),
    url(r'json/launch_scanner$', views.json_launch_scanner, name="json_launch_scanner"),
    url(r'last_scanned_image$', views.get_last_scanned_image, name="last_scanned_image"),
    url(r'scanned_image/(?P<id>[0-9]{1,3})$', views.get_session_image_id, name="get_scanned_image_id"),
    url(r'^$', views.scanpage, name="scanpage"),
)
