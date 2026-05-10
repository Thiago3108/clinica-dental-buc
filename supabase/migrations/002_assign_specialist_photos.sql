-- Migración 002: Asignar fotos a los especialistas
-- Ejecuta este script en el SQL Editor de Supabase para asignar
-- las fotos de cada especialista a su perfil.

UPDATE specialists SET photo_url = '/img/profesionales/jonny_contreras.png'
WHERE slug = 'jhonny-contreras';

UPDATE specialists SET photo_url = '/img/profesionales/Drfelipequinceno.png'
WHERE slug = 'felipe-quiceno';

UPDATE specialists SET photo_url = '/img/profesionales/maximo_polonia.png'
WHERE slug = 'maximo-polonia';

UPDATE specialists SET photo_url = '/img/profesionales/vanessa_capacho.png'
WHERE slug = 'vanessa-capacho';
