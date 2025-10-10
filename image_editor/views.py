from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import base64
import io
from PIL import Image
import numpy as np
from . import image_processing

# Create your views here.

def home(request):
    """
    Vista principal del editor de imágenes
    
    ¿Qué hace esta función?
    - Recibe una petición HTTP (request)
    - Prepara datos para el template (context)
    - Renderiza el template HTML y lo devuelve
    """
    # Context: datos que pasamos al template
    context = {
        'title': 'Editor de Imágenes',
        'message': 'Editor de Imágenes usando las funciones creadas en clase',
        'instruction': 'Sube una imagen para empezar a editar',
        'supported_formats': ['JPG', 'PNG', 'GIF'],
        'max_size': '10MB'
    }
    
    # render() combina template + context + request
    return render(request, 'image_editor/home.html', context)


def editor(request):
    """
    Vista del editor de imágenes
    
    ¿Qué hace esta función?
    - Muestra la interfaz del editor
    - Incluye el sidebar con controles
    - Permite editar imágenes
    """
    # Obtener la imagen de la sesión o parámetros
    current_image = request.session.get('current_image', None)
    image_name = request.session.get('image_name', 'Imagen sin nombre')
    
    context = {
        'title': 'Editor de Imágenes',
        'current_image': current_image,
        'image_name': image_name,
    }
    
    return render(request, 'image_editor/editor.html', context)


@csrf_exempt
def upload_image(request):
    """
    Vista para subir imágenes
    
    ¿Qué hace esta función?
    - Recibe archivos de imagen
    - Los procesa y guarda
    - Devuelve respuesta JSON
    """
    if request.method == 'POST':
        if 'image' in request.FILES:
            image_file = request.FILES['image']
            
            try:
                # Leer la imagen con PIL
                image = Image.open(image_file)
                
                # Convertir a RGB si es necesario
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Guardar como base64 para la sesión
                buffer = io.BytesIO()
                image.save(buffer, format='JPEG', quality=90)
                image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
                image_url = f"data:image/jpeg;base64,{image_data}"
                
                # Guardar en la sesión
                request.session['current_image'] = image_url
                request.session['original_image'] = image_url  # Guardar imagen original
                request.session['image_name'] = image_file.name
                request.session['image_type'] = image_file.content_type
                request.session['image_size'] = image.size
                
                return JsonResponse({
                    'success': True,
                    'message': 'Imagen subida exitosamente',
                    'image_url': image_url,
                    'image_name': image_file.name,
                    'image_size': image.size
                })
                
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'error': f'Error al procesar la imagen: {str(e)}'
                })
        else:
            return JsonResponse({
                'success': False,
                'error': 'No se encontró archivo de imagen'
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})


@csrf_exempt
def apply_filter(request):
    """
    Vista para aplicar filtros a las imágenes
    
    ¿Qué hace esta función?
    - Recibe parámetros de filtro
    - Aplica el filtro a la imagen
    - Devuelve la imagen procesada
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            filter_type = data.get('filter_type')
            
            # Obtener la imagen de la sesión
            current_image = request.session.get('current_image')
            if not current_image:
                return JsonResponse({
                    'success': False,
                    'error': 'No hay imagen cargada'
                })
            
            # Decodificar la imagen base64
            if current_image.startswith('data:image'):
                image_data = current_image.split(',')[1]
            else:
                image_data = current_image
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Aplicar filtro según el tipo
            if filter_type == 'brillo_global':
                delta = data.get('delta', 0)
                processed_image = image_processing.ajustar_brillo_global(image, delta)
                
            elif filter_type == 'brillo_canal':
                delta_r = data.get('delta_r', 0)
                delta_g = data.get('delta_g', 0)
                delta_b = data.get('delta_b', 0)
                processed_image = image_processing.ajustar_brillo_por_canal(
                    image, delta_r, delta_g, delta_b)
                
            elif filter_type == 'contraste_log':
                c = data.get('c', None)
                processed_image = image_processing.ajustar_contraste_logaritmico(image, c)
                
            elif filter_type == 'contraste_exp':
                k = data.get('k', 0.01)
                processed_image = image_processing.ajustar_contraste_exponencial(image, k)
                
            elif filter_type == 'grises':
                processed_image = image_processing.convertir_a_grises(image)
                
            elif filter_type == 'negativo':
                processed_image = image_processing.aplicar_inversion_colores(image)
                
            elif filter_type == 'binario':
                umbral = data.get('umbral', 128)
                processed_image = image_processing.convertir_a_binaria(image, umbral)
                
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Tipo de filtro no reconocido: {filter_type}'
                })
            
            # Convertir imagen procesada a base64
            buffer = io.BytesIO()
            if processed_image.ndim == 2:  # Imagen en escala de grises
                Image.fromarray(processed_image, mode='L').save(buffer, format='JPEG', quality=90)
            else:  # Imagen RGB
                Image.fromarray(processed_image).save(buffer, format='JPEG', quality=90)
            
            processed_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
            processed_url = f"data:image/jpeg;base64,{processed_data}"
            
            # Actualizar la sesión con la imagen procesada
            request.session['current_image'] = processed_url
            
            return JsonResponse({
                'success': True,
                'message': f'Filtro {filter_type} aplicado exitosamente',
                'filtered_image_url': processed_url
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error al aplicar filtro: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})


@csrf_exempt
def apply_multiple_filters(request):
    """
    Vista para aplicar múltiples filtros sobre la imagen original
    
    ¿Qué hace esta función?
    - Recibe todos los parámetros de filtros
    - Aplica todos los filtros sobre la imagen original
    - Devuelve la imagen procesada
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Obtener la imagen original de la sesión
            original_image = request.session.get('original_image')
            if not original_image:
                return JsonResponse({
                    'success': False,
                    'error': 'No hay imagen original cargada'
                })
            
            # Decodificar la imagen original
            if original_image.startswith('data:image'):
                image_data = original_image.split(',')[1]
            else:
                image_data = original_image
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Aplicar todos los filtros en secuencia sobre la imagen original
            processed_image = image.copy()
            
            # 1. Brillo Global
            if 'global_brightness' in data:
                delta = data['global_brightness'] - 100
                processed_image = image_processing.ajustar_brillo_global(processed_image, delta)
            
            # 2. Brillo por Canal
            if 'red_brightness' in data or 'green_brightness' in data or 'blue_brightness' in data:
                delta_r = data.get('red_brightness', 100) - 100
                delta_g = data.get('green_brightness', 100) - 100
                delta_b = data.get('blue_brightness', 100) - 100
                processed_image = image_processing.ajustar_brillo_por_canal(
                    processed_image, delta_r, delta_g, delta_b)
            
            # 3. Contraste Logarítmico
            if 'log_contrast' in data and data['log_contrast'] > 0:
                c = data['log_contrast'] / 100.0
                processed_image = image_processing.ajustar_contraste_logaritmico(processed_image, c)
            
            # 4. Contraste Exponencial
            if 'exp_contrast' in data and data['exp_contrast'] > 0:
                k = data['exp_contrast'] / 100.0 * 0.1
                processed_image = image_processing.ajustar_contraste_exponencial(processed_image, k)
            
            # 5. Efectos
            if data.get('grayscale', False):
                processed_image = image_processing.convertir_a_grises(processed_image)
            
            if data.get('negative', False):
                processed_image = image_processing.aplicar_inversion_colores(processed_image)
            
            if data.get('binary', False):
                threshold = data.get('threshold', 128)
                processed_image = image_processing.convertir_a_binaria(processed_image, threshold)
            
            # Convertir imagen procesada a base64
            buffer = io.BytesIO()
            if processed_image.ndim == 2:  # Imagen en escala de grises
                Image.fromarray(processed_image, mode='L').save(buffer, format='JPEG', quality=90)
            else:  # Imagen RGB
                Image.fromarray(processed_image).save(buffer, format='JPEG', quality=90)
            
            processed_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
            processed_url = f"data:image/jpeg;base64,{processed_data}"
            
            # Actualizar la sesión con la imagen procesada
            request.session['current_image'] = processed_url
            
            return JsonResponse({
                'success': True,
                'message': 'Filtros aplicados exitosamente',
                'filtered_image_url': processed_url
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error al aplicar filtros: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})