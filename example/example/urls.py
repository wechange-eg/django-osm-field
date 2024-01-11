from django.urls import include, path
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('admin/', include(admin.site.urls)),
    path('', 'example.views.list_view', name='list'),
    path('create/', 'example.views.create_view', name='create'),
    path('<int:pk>/', 'example.views.detail_view', name='detail'),
    path('<int:pk>/delete/', 'example.views.delete_view', name='delete'),
    path('<int:pk>/update/', 'example.views.update_view', name='update'),
]

urlpatterns += staticfiles_urlpatterns()
