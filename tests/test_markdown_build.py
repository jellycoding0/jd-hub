import hashlib
import json
from pathlib import Path
import re
import runpy
from contextlib import contextmanager
import shutil
from uuid import uuid4
import unittest

ROOT = Path(__file__).resolve().parents[1]
BUILD = runpy.run_path(str(ROOT / 'build_dashboard.py'))


@contextmanager
def test_directory():
    directory = ROOT / 'tests' / ('tmp_' + uuid4().hex)
    directory.mkdir()
    try:
        yield directory
    finally:
        assert directory.resolve().is_relative_to((ROOT / 'tests').resolve())
        shutil.rmtree(directory)


class MarkdownBuildTests(unittest.TestCase):
    def test_generated_manifest_and_all_markdown_bodies(self):
        script = (ROOT / 'docs/jobs.js').read_text(encoding='utf-8')
        jobs = json.JSONDecoder().raw_decode(script.split('const JOBS_DATA = ', 1)[1])[0]
        interviews = json.JSONDecoder().raw_decode(script.split('const INTERVIEW_DATA = ', 1)[1])[0]
        expected = {}
        for directory, category in [('+01_기업별', None), ('+03_학습가이드_및_정보', '학습_가이드')]:
            for source in (ROOT / directory).rglob('*.md'):
                if category and source.name.startswith('_'):
                    continue
                parsed = BUILD['parse_markdown_file'](str(source), category or source.parent.name)
                expected[parsed.pop('id')] = parsed
        self.assertEqual({entry['id'] for entry in jobs}, set(expected))
        self.assertEqual(len({entry['id'] for entry in jobs}), len(jobs))
        for entry in jobs:
            self.assertNotIn('raw_content', entry)
            body = self.check_published_file(entry)
            original = expected[entry['id']]
            self.assertEqual(body, original.pop('raw_content'))
            for key, value in original.items():
                self.assertEqual(entry[key], value)
        sources = {p.stem: p for p in (ROOT / '+02_직무별_면접_기출').glob('*.md')}
        self.assertEqual(set(interviews), set(sources))
        for category, entry in interviews.items():
            body = self.check_published_file(entry)
            self.assertEqual(body, sources[category].read_text(encoding='utf-8-sig').strip())
            self.assertEqual(entry['question_count'], len(re.findall(r'^## Q\d+', body, re.M)))

    def check_published_file(self, entry):
        path = ROOT / 'docs' / entry['content_path']
        self.assertTrue(path.resolve().is_relative_to((ROOT / 'docs/content').resolve()))
        data = path.read_bytes()
        self.assertEqual(hashlib.sha256(data).hexdigest()[:16], entry['content_version'])
        return data.decode('utf-8')

    def test_public_body_keeps_existing_private_section_exclusion(self):
        with test_directory() as directory:
            self.assertTrue(Path(directory).resolve().is_relative_to((ROOT / 'tests').resolve()))
            source = Path(directory) / '회사_2609_제어.md'
            source.write_text('---\ntags:\n  - 제어\n---\n# 공개\n\n## 수강생 준비 포인트\n- 비공개 메모\n\n## 지원 자격\n- 공개 조건\n', encoding='utf-8-sig')
            parsed = BUILD['parse_markdown_file'](str(source), '회사')
            self.assertEqual(parsed['tags'], ['제어'])
            self.assertNotIn('비공개 메모', parsed['raw_content'])
            self.assertNotIn('tags:', parsed['raw_content'])
            self.assertIn('공개 조건', parsed['raw_content'])
            output = Path(directory) / 'docs'
            entry = BUILD['publish_markdown'](parsed['raw_content'], source, Path(directory), output)
            first_version = entry['content_version']
            updated = BUILD['publish_markdown']('# 새 내용', source, Path(directory), output)
            self.assertEqual(entry['content_path'], updated['content_path'])
            self.assertNotEqual(first_version, updated['content_version'])


if __name__ == '__main__':
    unittest.main()
