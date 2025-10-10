from django.urls import path
from . import views

# app_name: nombre de la aplicación para evitar conflictos
app_name = 'image_editor'

# urlpatterns: lista de rutas URL
urlpatterns = [
    # path('ruta/', vista, nombre='nombre')
    path('', views.home, name='home'),
    path('editor/', views.editor, name='editor'),
    path('upload/', views.upload_image, name='upload'),
    path('apply-filter/', views.apply_filter, name='apply_filter'),
    path('apply-multiple-filters/', views.apply_multiple_filters, name='apply_multiple_filters'),
]
