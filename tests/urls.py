from django.urls import patterns, include, path

from django.contrib import admin


admin.autodiscover()

urlpatterns = patterns('',
    path('admin/', include(admin.site.urls)),
)
