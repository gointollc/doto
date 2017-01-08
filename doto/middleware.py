import re, jwt
from django.conf import settings

jwt_pattern = re.compile(r'^[\d\w\.\-]+$')

class TokenUser(object):
    """ A simple user to mimic the User model """
    user_id = None
    first_name = None
    last_name = None
    email = None

    def __init__(self, user_id, first_name, last_name, email):
        self.user_id = user_id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email

class JWTAuth(object):
    """ Check the token for validity """

    def process_request(self, request):
        print("process_request")
        
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        request.is_authenticated = False
        request.token_user = None

        # sanity check real quick
        if auth_header:

            print("Auth header: " + auth_header)
            # Remove leading 'Basic '
            auth_header = auth_header.replace('Basic ', '')

            if jwt_pattern.match(auth_header):
                print ("Found a token...")
                jwt_object = jwt.decode(auth_header, settings.SECRET_KEY)
                print(jwt_object)
                if jwt_object:
                    print('token object exists and was decoded...')
                    request.jwt = jwt_object
                    request.token_user = TokenUser(jwt_object.get('user_id'), jwt_object.get('first_name'), jwt_object.get('last_name'), jwt_object.get('email'))
                    request.is_authenticated = True

        return None