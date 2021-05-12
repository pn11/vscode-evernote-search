import configparser
import os
from os.path import join, dirname
import pathlib

try: 
    from evernote.api.client import EvernoteClient
    import evernote.edam.userstore.constants as UserStoreConstants
    import evernote.edam.type.ttypes as Types
except ModuleNotFoundError:
    print("Evernote python module not found. Please install with `pip install evernote3`.")
    raise ModuleNotFoundError

class EvernoteTokenLoadError(Exception):
    pass

def login():
    try:
        cfgfile = str(pathlib.Path.home())+'/.evernote-search.cfg'
        config = configparser.ConfigParser()
        config.read(cfgfile)
        auth_token = config['settings']['EVERNOTE_TOKEN']
    except Exception:
        print('Failed to load Evernote token. Visit https://sandbox.evernote.com/api/DeveloperToken.action',
        'to get your developer token and save it to $HOME/.evernote-search-token.cfg like below:\n',
        '[settings]\n', 'EVERNOTE_TOKEN = YOUR_DEV_TOKEN\n')
        raise EvernoteTokenLoadError

    sandbox = False
    china = False

    client = EvernoteClient(token=auth_token, sandbox=sandbox, china=china)

    user_store = client.get_user_store()

    version_ok = user_store.checkVersion(
        "Evernote EDAMTest (Python)",
        UserStoreConstants.EDAM_VERSION_MAJOR,
        UserStoreConstants.EDAM_VERSION_MINOR
    )

    if not version_ok:
        exit(1)

    return client
