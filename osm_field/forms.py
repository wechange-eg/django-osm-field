# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.forms.widgets import Media, TextInput
from django.templatetags.static import static
from django.utils.html import format_html, mark_safe

import osm_field


def _get_js(debug=False):
    base = ['js/vendor/leaflet.js']
    js_path = static('js/osm_field.js')
    versioned_js = mark_safe(f'<script src="{js_path}?js_v={osm_field.__version__}"></script>')
    if debug:
        base.extend([versioned_js])
    else:
        base.extend([versioned_js])
    return base


def _get_css(debug=False):
    base = ['css/vendor/leaflet.css']
    if debug:
        base.extend(['css/osm_field.css'])
    else:
        base.extend(['css/osm_field.css'])
    return base


class OSMWidget(TextInput):
    """
    Adds a OpenStreetMap Leaflet dropdown map to the front-end once the user
    focuses the form field. See :ref:`the usage chapter <usage-template-layer>`
    on how to integrate the CSS and JavaScript code.
    """

    @property
    def media(self):
        return Media(
            css={'screen': _get_css(settings.DEBUG)},
            js=_get_js(settings.DEBUG)
        )

    def __init__(self, lat_field, lon_field, attrs=None):
        attrs = {} if attrs is None else attrs.copy()
        attrs.update({
            'data-lat-field': lat_field,
            'data-lon-field': lon_field,
        })
        if 'class' in attrs:
            attrs['class'] += ' osmfield'
        else:
            attrs['class'] = 'osmfield'
        super(OSMWidget, self).__init__(attrs=attrs)

    def render(self, name, value, attrs=None, renderer=None):
        ret = super(OSMWidget, self).render(name, value, attrs=attrs)
        id_ = attrs['id']
        ret += self.render_osmfield(id_)
        return ret

    def render_osmfield(self, id_):
        if getattr(settings, 'OSMFIELD_NO_POPUP', False):
            return format_html(
                '<div class="osmfield-embedded-map" id="{0}-map"></div>', id_)
        else:
            return ''
