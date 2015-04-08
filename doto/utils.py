
def datetime_to_iso(dt):
    """ Convert datetime to iso format string """
    if dt:
        dt = dt.isoformat()
    return dt