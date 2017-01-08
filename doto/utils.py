from datetime import datetime
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
        
        status = context.get('status')
        message = context.get('message', '')

        if context.get('objects'):
            status = True
            data = self.objs_to_list_dicts(context.get('objects'))
        else:
            data = None
            if not status:
                status = False
            if not message:
                message = 'No %ss found.' % (context.get('object_name') or 'record')
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

def datetime_to_iso(dt):
    """ Convert datetime to iso format string """
    if type(dt) == type(str()):
        datetime.strptime(dt, '%Y-%m-%d')
    elif dt:
        dt = dt.isoformat()
    elif dt == '':
        dt = None
    return dt

def response_unauthorized(**response_kwargs):
    return JsonResponse(
            {'status': False, 'message': "You must be logged in.", 'data': []},
            **response_kwargs
        )