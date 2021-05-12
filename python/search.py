import argparse

try: 
    import evernote.edam.notestore.NoteStore as NoteStore
except ModuleNotFoundError:
    print("Evernote python module not found. Please install with `pip install evernote3 oauth2`.")
    raise ModuleNotFoundError

import login


def main():
    parser = argparse.ArgumentParser(
        description='Search your note in Evernote')
    parser.add_argument('search_query', help='search query')
    args = parser.parse_args()

    client = login.login()
    user = client.get_user_store().getUser()
    note_store = client.get_note_store()

    # 検索用のフィルター
    filter = NoteStore.NoteFilter()
    # この記法が使える https://dev.evernote.com/doc/articles/search_grammar.php
    #filter.words = "created:month-1 notebook:Note"
    filter.words = args.search_query
    filter.ascending = False

    spec = NoteStore.NotesMetadataResultSpec()
    spec.includeTitle = True

    noteList = note_store.findNotesMetadata(filter, 0, 100, spec)
    print(f'<h2>Search result for "{args.search_query}"</h2>')
    create_html(user, noteList.notes)

def make_link(user, note):
    return f"https://www.evernote.com/shard/{user.shardId}/nl/{user.id}/{note.guid}"

def create_html(user, notes):
    html = ""
    html += "<ul>"
    for note in notes:
        html += f'<li><a href="{make_link(user, note)}">{note.title}</a></li>'
    html += "</ul>"
    print(html)


if __name__ == '__main__':
    main()
