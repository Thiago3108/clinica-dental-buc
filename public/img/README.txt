═══════════════════════════════════════════════════════════════════
   GUÍA DE IMÁGENES - CLÍNICA DENTAL BUC
═══════════════════════════════════════════════════════════════════

Coloca las imágenes en las carpetas correspondientes con los
nombres exactos indicados a continuación. La aplicación las
detectará automáticamente.


/img/logo/
─────────────────────────────────────────────────────────────
   logo.png            ← Logo principal (transparente, 512x512 ideal)
   logo-dark.png       ← Logo para fondos oscuros (opcional)
   favicon.png         ← Favicon (32x32 o 64x64)


/img/hero/                                            (NUEVO)
─────────────────────────────────────────────────────────────
   Imágenes del Hero (parte superior de la landing):

   hero.jpg            ← Imagen de fondo (paisaje, 1920x1080)
                         se muestra con opacidad baja sobre overlay azul
   clinica.jpg         ← Foto destacada (vertical 4:5, ~800x1000)
                         aparece flotante a la derecha del hero

   Si no existes estas imágenes, el hero igual se ve bien con
   el degradado azul como fondo.


/img/profesionales/
─────────────────────────────────────────────────────────────
   Coloca aquí las fotos de los especialistas. Luego en
   /admin/especialistas pega la ruta como URL de foto, ej:
       /img/profesionales/jhonny.jpg
       /img/profesionales/felipe.jpg
       /img/profesionales/maximo.jpg
       /img/profesionales/vanessa.jpg

   Tamaño recomendado: vertical 3:4 (ej. 800x1067 px)
   Ahora se muestran como cards verticales con foto grande


/img/servicios/{categoría}/{número}.jpg
─────────────────────────────────────────────────────────────
   La galería de la landing ahora usa TABS interactivos.
   Solo se muestra una categoría a la vez (6 imágenes).

   Nombra los archivos como 1.jpg, 2.jpg, ..., 6.jpg

   Categorías y rutas:
       /img/servicios/implantes/1.jpg ... 6.jpg
       /img/servicios/ortodoncia/1.jpg ... 6.jpg
       /img/servicios/estetica/1.jpg ... 6.jpg
       /img/servicios/endodoncia/1.jpg ... 6.jpg
       /img/servicios/diseno/1.jpg ... 6.jpg

   Tamaño recomendado: cuadrada 800x800 px (se recortan)


/img/testimonios/
─────────────────────────────────────────────────────────────
   Fotos de los pacientes que dan testimonio:
       /img/testimonios/1.jpg
       /img/testimonios/2.jpg
       /img/testimonios/3.jpg

   Tamaño recomendado: cuadrada 200x200 px


TESTIMONIOS CON VIDEO DE INSTAGRAM (opcional)
─────────────────────────────────────────────────────────────

   Si tienes reels de Instagram con testimonios, puedes
   agregarlos editando:

       components/public/TestimonialsSection.tsx

   Busca el array TESTIMONIALS y descomenta/agrega el campo:

       instagramReel: "https://www.instagram.com/reel/CODIGO_DEL_REEL/"

   Aparecerá un botón circular con ícono de play (gradiente
   rosa-naranja, estilo Instagram) que abre el reel en nueva
   pestaña. No se embebe el video directamente para no afectar
   el rendimiento de la página.


NOTAS
─────────────────────────────────────────────────────────────

   • Si una imagen no existe, se mostrará un placeholder de icono
     en gris (no se rompe la app)
   • Formatos aceptados: JPG, PNG, WEBP
   • Recomendado: comprimir las imágenes para web (TinyPNG, etc.)
     antes de subirlas, para que la página cargue rápido
   • Si quieres cambiar el número de imágenes por categoría,
     edita el campo "count" en:
        components/public/GallerySection.tsx

═══════════════════════════════════════════════════════════════════
