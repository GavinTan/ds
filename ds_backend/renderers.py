from rest_framework.renderers import JSONRenderer
from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.views import Response


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):

        status_code = renderer_context.get('response').status_code
        if status.is_success(status_code) and renderer_context.get('view').get_view_name() != 'Api Root':
            if isinstance(data, dict):
                data.update({'code': status_code, 'success': True})
            else:
                data = {'code': status_code, 'success': True, 'data': data}

        # else:
        #     data = {'code': 50000, 'data': None, 'error': data, 'success': False}

        response = super().render(data, accepted_media_type, renderer_context)
        return response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        data = {
            'code': response.status_code,
            'data': [],
            'error': response.data.get('detail') or response.data,
            'success': False
        }
        response.data = data
    return response
