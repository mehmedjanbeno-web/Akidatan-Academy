#!/usr/bin/env python3
"""Install the prepared five-course catalog on the existing Academy server."""
import ast
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

MODULE = '''import json
from pathlib import Path
from flask import abort, jsonify

def install(namespace):
    app = namespace["app"]
    if "academy_catalog_v1" in app.view_functions:
        return
    source = Path(__file__).with_name("courses_import.json")
    def courses():
        return json.loads(source.read_text(encoding="utf-8"))["courses"]
    def find(number):
        course = next((c for c in courses() if c["number"] == number), None)
        if course is None:
            abort(404)
        return course
    def catalog():
        response = jsonify(version=1, courses=[
            {"number": c["number"], "lessons": len(c["audio"])}
            for c in courses()
        ])
        response.headers["Cache-Control"] = "no-store"
        return response
    def audio(course_number, lesson_number):
        rows = find(course_number)["audio"]
        if not 1 <= lesson_number <= len(rows):
            abort(404)
        return namespace["proxy_media"](rows[lesson_number - 1])
    def pdf(course_number):
        row = find(course_number)["pdf"]
        return namespace["proxy_media"](row, row.get("file_name") or f"course-{course_number}.pdf")
    namespace["academy_lesson_numbers"] = lambda: range(1, 1 + sum(len(c["audio"]) for c in courses()))
    app.add_url_rule("/catalog", "academy_catalog_v1", catalog)
    app.add_url_rule("/course/<int:course_number>/lesson/<int:lesson_number>/audio", "academy_audio_v1", audio)
    app.add_url_rule("/course/<int:course_number>/pdf", "academy_pdf_v1", pdf)
'''

TEST = '''import academy_api as api
expected = [20, 33, 15, 30, 53]
client = api.app.test_client()
r = client.get('/catalog')
assert r.status_code == 200
assert [c['lessons'] for c in r.json['courses']] == expected
api.proxy_media = lambda row, *args, **kw: api.jsonify(message_id=row['message_id'])
for course, first, pdf, count in [(1,143,142,20),(2,6,5,33),(3,41,40,15),(4,58,57,30),(5,89,88,53)]:
    for lesson in (1,count):
        r=client.get(f'/course/{course}/lesson/{lesson}/audio')
        assert r.status_code == 200 and r.json['message_id'] == first+lesson-1
    r=client.get(f'/course/{course}/pdf')
    assert r.status_code == 200 and r.json['message_id'] == pdf
    assert client.get(f'/course/{course}/lesson/{count+1}/audio').status_code == 404
assert client.get('/course/6/pdf').status_code == 404
assert client.get('/lesson/1/audio').json['message_id'] == 143
assert client.get('/lesson/20/audio').json['message_id'] == 162
assert client.get('/lesson/21/audio').status_code == 404
assert len(list(api.academy_lesson_numbers())) == 151
'''

def main():
    root = Path('/opt/akidatan-bot')
    os.chdir(root)
    api = root / 'academy_api.py'
    module = root / 'academy_courses_v1.py'
    data = json.loads((root / 'courses_import.json').read_text())['courses']
    assert [c['number'] for c in data] == [1,2,3,4,5], 'Неверный порядок курсов'
    assert [len(c['audio']) for c in data] == [20,33,15,30,53], 'Неверное количество уроков'
    for c, pdf_id, start in zip(data, [142,5,40,57,88], [143,6,41,58,89]):
        assert c['pdf']['message_id'] == pdf_id
        assert [r['message_id'] for r in c['audio']] == list(range(start,start+len(c['audio'])))
    original = api.read_text(encoding='utf-8')
    updated = original
    tree = ast.parse(original)
    # Expand an existing course-1-only profile whitelist, if present.
    for fn in tree.body:
        if isinstance(fn, (ast.FunctionDef, ast.AsyncFunctionDef)) and fn.name in {'profile_save', 'profile_load'}:
            old_fn = ast.get_source_segment(original, fn)
            new_fn = old_fn
            for call in ast.walk(fn):
                if (isinstance(call, ast.Call) and isinstance(call.func, ast.Name)
                    and call.func.id == 'range' and len(call.args) == 2
                    and all(isinstance(a, ast.Constant) for a in call.args)
                    and [a.value for a in call.args] == [1,21]):
                    new_fn = new_fn.replace(ast.get_source_segment(original, call), 'academy_lesson_numbers()')
            updated = updated.replace(old_fn, new_fn)
    hook = 'from academy_courses_v1 import install as _install_academy_courses_v1\n_install_academy_courses_v1(globals())\n'
    if hook not in updated:
        tree = ast.parse(updated)
        lines = updated.splitlines(keepends=True)
        pos = next((n.lineno-1 for n in tree.body if isinstance(n, ast.If)
                    and '__name__' in ast.unparse(n.test) and '__main__' in ast.unparse(n.test)), len(lines))
        lines.insert(pos, '\n'+hook+'\n')
        updated = ''.join(lines)
    compile(updated, str(api), 'exec')
    compile(MODULE, str(module), 'exec')
    backup = Path('/opt/backups/akidatan') / ('courses_api_'+datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f'))
    backup.mkdir(parents=True)
    existed = {p: p.exists() for p in (api,module)}
    for p in (api,module):
        if existed[p]: shutil.copy2(p,backup/p.name)
    def write(path, text):
        temp = path.with_name(path.name+'.courses.tmp')
        temp.write_text(text, encoding='utf-8')
        if path.exists():
            shutil.copystat(path,temp)
            st=path.stat()
            os.chown(temp,st.st_uid,st.st_gid)
        os.replace(temp,path)
    try:
        write(module,MODULE)
        write(api,updated)
        subprocess.run([sys.executable,'-c',TEST],cwd=root,check=True)
        subprocess.run(['systemctl','restart','akidatan-api'],check=True)
        last_error = None
        for attempt in range(10):
            try:
                with urllib.request.urlopen('http://127.0.0.1:8010/catalog',timeout=3) as response:
                    live=json.load(response)
                assert [c['lessons'] for c in live['courses']] == [20,33,15,30,53]
                last_error=None
                break
            except Exception as e:
                last_error=e
                time.sleep(.5)
        if last_error: raise last_error
    except Exception:
        for p in (api,module):
            if existed[p]: shutil.copy2(backup/p.name,p)
            elif p.exists(): p.unlink()
        subprocess.run(['systemctl','restart','akidatan-api'],check=False)
        print('Изменения API отменены. Предыдущая версия восстановлена.')
        raise
    print('✅ API подключён: 5 курсов, 151 аудиоурок, 5 PDF.')
    print('✅ Проверены каталог, привязка уроков и PDF, старые ссылки первого курса.')
    print('Резервная копия:',backup)

if __name__ == '__main__':
    main()
