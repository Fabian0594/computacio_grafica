import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

# =========================
# Utilidades internas
# =========================
def _to_np_uint8(img):
    """Acepta np.ndarray o PIL.Image y retorna np.uint8 (H,W,3) o (H,W)."""
    if isinstance(img, Image.Image):
        arr = np.array(img)
    else:
        arr = np.asarray(img)
    if arr.dtype != np.uint8:
        arr = np.clip(arr, 0, 255).astype(np.uint8)
    return arr

def _ensure_rgb(img):
    """Convierte a RGB si viene como RGBA o escala de grises."""
    arr = _to_np_uint8(img)
    if arr.ndim == 2:  # gris -> RGB
        return np.stack([arr, arr, arr], axis=-1)
    if arr.ndim == 3 and arr.shape[2] == 4:  # RGBA -> RGB
        return arr[:, :, :3]
    return arr

def _match_size(img_base_np_uint8, img_to_resize):
    """Redimensiona img_to_resize al tamaño de img_base_np_uint8 con PIL bilinear."""
    base_h, base_w = img_base_np_uint8.shape[:2]
    if isinstance(img_to_resize, Image.Image):
        pil = img_to_resize.convert('RGB')
    else:
        arr = _ensure_rgb(img_to_resize)
        pil = Image.fromarray(arr)
    pil = pil.resize((base_w, base_h), resample=Image.BILINEAR)
    return np.array(pil, dtype=np.uint8)

# =========================
# 1. Brillo global
# =========================
def ajustar_brillo_global(img, delta):
    """Suma 'delta' (int) a todos los píxeles (positivo o negativo)."""
    arr = _to_np_uint8(img).astype(np.int16)
    arr = np.clip(arr + int(delta), 0, 255)
    return arr.astype(np.uint8)

# =========================
# 2. Brillo por canal (R,G,B)
# =========================
def ajustar_brillo_por_canal(img, delta_r=0, delta_g=0, delta_b=0):
    """Ajusta brillo por canal. Si es gris, se convierte a RGB."""
    arr = _ensure_rgb(img).astype(np.int16)
    deltas = np.array([delta_r, delta_g, delta_b], dtype=np.int16)
    arr = np.clip(arr + deltas, 0, 255)
    return arr.astype(np.uint8)

# =========================
# 3. Contraste logarítmico
# =========================
def ajustar_contraste_logaritmico(img, c=None):
    """s = c * log(1 + r). Si c=None, usa 255/log(256) para cubrir el rango."""
    arr = _to_np_uint8(img).astype(np.float32)
    if c is None:
        c = 255.0 / np.log(1.0 + 255.0)
    s = c * np.log(1.0 + arr)
    return np.clip(s, 0, 255).astype(np.uint8)

# =========================
# 4. Contraste exponencial y gamma
# =========================
def ajustar_contraste_exponencial(img, k=0.01):
    """
    s = (exp(k*r) - 1) / (exp(k*255) - 1) * 255
    k>0 aumenta contraste en sombras; k mayores contrastan más.
    """
    arr = _to_np_uint8(img).astype(np.float32)
    denom = np.exp(k * 255.0) - 1.0
    s = (np.exp(k * arr) - 1.0) / (denom + 1e-12) * 255.0
    return np.clip(s, 0, 255).astype(np.uint8)

def ajustar_contraste_gamma(img, gamma=1.0):
    """Corrección gamma: s = 255 * (r/255)^gamma. gamma<1 aclara; gamma>1 oscurece."""
    arr = _to_np_uint8(img).astype(np.float32) / 255.0
    s = np.power(arr, gamma) * 255.0
    return np.clip(s, 0, 255).astype(np.uint8)

# =========================
# 5. Recorte (crop)
# =========================
def recortar_imagen(img, x1, y1, x2, y2):
    """Recorta por coordenadas (x1,y1) sup-izq y (x2,y2) inf-der (x2,y2 excluidos)."""
    arr = _to_np_uint8(img)
    h, w = arr.shape[:2]
    x1, y1 = int(np.clip(x1, 0, w-1)), int(np.clip(y1, 0, h-1))
    x2, y2 = int(np.clip(x2, x1+1, w)), int(np.clip(y2, y1+1, h))
    return arr[y1:y2, x1:x2].copy()

# =========================
# 6. Zoom (ampliar sobre un área)
# =========================
def aplicar_zoom_area(img, bbox, escala=2.0, metodo=Image.BILINEAR):
    """Ampliación de un sub-rectángulo bbox=(x1,y1,x2,y2) por 'escala'."""
    x1, y1, x2, y2 = map(int, bbox)
    sub = recortar_imagen(img, x1, y1, x2, y2)
    pil = Image.fromarray(_to_np_uint8(sub))
    W = max(1, int((x2 - x1) * escala))
    H = max(1, int((y2 - y1) * escala))
    pil_zoom = pil.resize((W, H), resample=metodo)
    return np.array(pil_zoom, dtype=np.uint8)

# =========================
# 7. Rotación (ángulo libre)
# =========================
def rotar_imagen(img, angulo_grados, expand=True, fillcolor=(0, 0, 0)):
    """Rotación con PIL. expand=True evita recortes. fillcolor para fondo."""
    arr = _to_np_uint8(img)
    if arr.ndim == 2:
        pil = Image.fromarray(arr, mode='L')
        rotated = pil.rotate(angulo_grados, resample=Image.BILINEAR, expand=expand,
                             fillcolor=fillcolor if isinstance(fillcolor, int) else 0)
    else:
        pil = Image.fromarray(_ensure_rgb(arr))
        rotated = pil.rotate(angulo_grados, resample=Image.BILINEAR, expand=expand,
                             fillcolor=fillcolor)
    return np.array(rotated, dtype=np.uint8)

# =========================
# 8. Visualización del histograma
# =========================
def visualizar_histograma_rgb(img, titulo="Histograma"):
    """Muestra histograma por canal RGB y luminancia (BT.709)."""
    arr = _to_np_uint8(img)
    plt.figure()
    if arr.ndim == 2:
        plt.title(f"{titulo} (Gris)")
        plt.hist(arr.ravel(), bins=256, range=(0, 255))
    else:
        plt.title(titulo)
        canales = ('R', 'G', 'B')
        for i, c in enumerate(canales):
            plt.hist(arr[:, :, i].ravel(), bins=256, range=(0, 255), alpha=0.5, label=c)
        luma = (0.2126*arr[:, :, 0] + 0.7152*arr[:, :, 1] + 0.0722*arr[:, :, 2]).astype(np.uint8)
        plt.hist(luma.ravel(), bins=256, range=(0, 255), alpha=0.5, label='Luma')
        plt.legend()
    plt.xlabel('Intensidad')
    plt.ylabel('Frecuencia')
    plt.show()

# =========================
# 9. Fusión de dos imágenes (alpha blend)
# =========================
def fusionar_imagenes(img1, img2, alpha=0.5):
    """s = alpha*img1 + (1-alpha)*img2. Redimensiona img2 al tamaño de img1."""
    a = float(alpha)
    a = max(0.0, min(1.0, a))
    A = _ensure_rgb(img1).astype(np.float32)
    B = _match_size(A, img2).astype(np.float32)
    S = a*A + (1.0 - a)*B
    return np.clip(S, 0, 255).astype(np.uint8)

# =========================
# 10. Fusión de imágenes ecualizadas
# =========================
def _histeq_gris(gray):
    """Ecualización de histograma para imagen en escala de grises uint8."""
    hist, _ = np.histogram(gray.ravel(), 256, [0, 256])
    cdf = hist.cumsum()
    cdf_m = np.ma.masked_equal(cdf, 0)
    cdf_m = (cdf_m - cdf_m.min()) * 255 / (cdf_m.max() - cdf_m.min() + 1e-12)
    cdf = np.ma.filled(cdf_m, 0).astype('uint8')
    return cdf[gray]

def _histeq_por_canal(rgb):
    """Ecualización por canal en RGB."""
    out = np.empty_like(rgb)
    for i in range(3):
        out[:, :, i] = _histeq_gris(rgb[:, :, i])
    return out

def fusionar_imagenes_ecualizadas(img1, img2, alpha=0.5, por_canal=True):
    """Ecualiza ambas imágenes (por canal o por luminancia) y luego hace alpha-blend."""
    A = _ensure_rgb(img1)
    B = _match_size(A, img2)
    if por_canal:
        Aeq = _histeq_por_canal(A)
        Beq = _histeq_por_canal(B)
    else:
        def eq_luma(RGB):
            l = (0.2126*RGB[:, :, 0] + 0.7152*RGB[:, :, 1] + 0.0722*RGB[:, :, 2]).astype(np.uint8)
            leq = _histeq_gris(l).astype(np.float32)
            l_safe = np.maximum(l.astype(np.float32), 1.0)
            gain = (leq + 1e-6) / l_safe
            out = np.clip(RGB.astype(np.float32) * gain[..., None], 0, 255).astype(np.uint8)
            return out
        Aeq, Beq = eq_luma(A), eq_luma(B)
    return fusionar_imagenes(Aeq, Beq, alpha)

# =========================
# 11. Extracción de capas RGB
# =========================
def extraer_capas_rgb(img):
    """Devuelve (R_img, G_img, B_img) como imágenes enmascaradas por canal."""
    arr = _ensure_rgb(img)
    layers = []
    for i in range(3):
        lay = np.zeros_like(arr)
        lay[:, :, i] = arr[:, :, i]
        layers.append(lay)
    return tuple(layers)

def extraer_capa_rgb(img, indice_capa):
    """Devuelve una imagen con solo una capa RGB: indice_capa en {0:R,1:G,2:B}."""
    arr = _ensure_rgb(img)
    out = np.zeros_like(arr)
    out[:, :, indice_capa] = arr[:, :, indice_capa]
    return out

# =========================
# 12. Extracción de capas CMYK (desde RGB)
# =========================
def convertir_rgb_a_cmyk(img):
    """
    Convierte RGB uint8 a CMYK uint8 (H,W,4).
    K = 1 - max(R',G',B'); C=(1-R'-K)/(1-K) ...; si K=1 => C=M=Y=0.
    """
    rgb = _ensure_rgb(img).astype(np.float32) / 255.0
    R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    K = 1.0 - np.maximum.reduce([R, G, B])
    denom = (1.0 - K) + 1e-12
    C = (1.0 - R - K) / denom
    M = (1.0 - G - K) / denom
    Y = (1.0 - B - K) / denom
    CMYK = np.stack([C, M, Y, K], axis=-1)
    return np.clip(CMYK * 255.0, 0, 255).astype(np.uint8)

def extraer_capas_cmyk(img):
    """Devuelve (C_img, M_img, Y_img, K_img) como imágenes enmascaradas por canal."""
    cmyk = convertir_rgb_a_cmyk(img)
    layers = []
    for i in range(4):
        lay = np.zeros_like(cmyk)
        lay[:, :, i] = cmyk[:, :, i]
        layers.append(lay)
    return tuple(layers)

def suprimir_capa_cmyk(img, capa):
    """
    Pone a 0 un canal CMYK ('c','m','y','k') y reconstruye un RGB aproximado.
    """
    cmyk = convertir_rgb_a_cmyk(img).astype(np.float32) / 255.0
    idx = {'c': 0, 'm': 1, 'y': 2, 'k': 3}.get(str(capa).lower(), None)
    if idx is None:
        raise ValueError("capa debe ser 'c','m','y' o 'k'")
    cmyk[:, :, idx] = 0.0
    C, M, Y, K = [cmyk[:, :, i] for i in range(4)]
    R = (1.0 - np.minimum(1.0, C + K))
    G = (1.0 - np.minimum(1.0, M + K))
    B = (1.0 - np.minimum(1.0, Y + K))
    rgb = np.stack([R, G, B], axis=-1)
    return np.clip(rgb * 255.0, 0, 255).astype(np.uint8)

# =========================
# 13. Foto negativa
# =========================
def aplicar_inversion_colores(img):
    """Foto negativa: 255 - img."""
    arr = _to_np_uint8(img)
    return 255 - arr

# =========================
# 14. Conversión a escala de grises
# =========================
def convertir_a_grises(img, metodo='luma'):
    """Convierte a gris (uint8). metodo: 'luma' (BT.709) o 'promedio'."""
    arr = _to_np_uint8(img)
    if arr.ndim == 2:
        return arr
    R = arr[:, :, 0].astype(np.float32)
    G = arr[:, :, 1].astype(np.float32)
    B = arr[:, :, 2].astype(np.float32)
    if metodo == 'promedio':
        gray = (R + G + B) / 3.0
    else:
        gray = 0.2126 * R + 0.7152 * G + 0.0722 * B
    return np.clip(gray, 0, 255).astype(np.uint8)

# =========================
# 15. Binarización con umbral
# =========================
def convertir_a_binaria(img, umbral=128):
    """Umbral fijo (0..255). Si es RGB, primero pasa a gris (luma)."""
    gray = convertir_a_grises(img)
    out = np.zeros_like(gray, dtype=np.uint8)
    out[gray >= int(umbral)] = 255
    return out
