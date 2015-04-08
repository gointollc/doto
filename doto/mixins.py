#from django.utils import simplejson
from django.http import JsonResponse

class JSONResponseMixin(object):
    """
    A mixin that can be used to render a JSON response.
    """
    def render_to_json_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        return JsonResponse(
            self.get_data(context),
            **response_kwargs
        )

    def get_data(self, context):
        print('get_data context: ', context)
        
        status = 'ok'
        message = ''

        if context.get('objects'):
            data = self.objs_to_list_dicts(context.get('objects'))
        else:
            data = None
            status = 'error'
            message = 'No records returned.'
        output = {
            'status': status,
            'message': message,
            'data': data,
        }
        return output

    def objs_to_list_dicts(self, objs):
        """ Turn objects into a list of dictionaries """
        dicts = []
        for o in objs:
            dicts.append(o.to_object())
        return dicts