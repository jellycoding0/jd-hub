"""Execute trusted, repository-authored Python solutions against examples and edge cases."""
import json
import re
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / '+03_학습가이드_및_정보/_모의코딩테스트.md'


class CodingContentTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sections = re.split(r'^## ', SOURCE.read_text(encoding='utf-8'), flags=re.M)[1:]
        cls.functions = {}
        for section in cls.sections:
            namespace = {}
            exec(re.search(r'```python\n(.*?)```', section, re.S)[1], namespace)
            cls.functions[section.split('|')[0].strip()] = namespace['solve']

    def test_examples(self):
        self.assertEqual(len(self.functions), 10)
        for section in self.sections:
            key = section.split('|')[0].strip()
            arguments, expected = map(json.loads, re.findall(r'```json\n(.*?)```', section, re.S))
            with self.subTest(question=key):
                self.assertEqual(self.functions[key](**arguments), expected)

    def test_boundaries(self):
        cases = {
            'C01': [(([], 0, 0), 0), (([-1, 0, 1], -1, 1), 3)],
            'C02': [(([],), 0), (([0, 0],), 0), (([1, 1],), 2)],
            'C03': [(('',), ''), (('F',), 'F1'), (('FLF',), 'F1L1F1'), (('R'*12,), 'R12')],
            'C04': [(('',), [0, 0]), (('NSWE',), [0, 0]), (('WWWSS',), [-3, -2])],
            'C05': [(([-5, -2, -3], 2), -5), (([10**9]*3, 3), 3*10**9), (([-2], 1), -2)],
            'C06': [(([],), -1), (([4, 5, 6],), -1), (([9, 2, 2, 9],), 2)],
            'C07': [((3, 3, [0, 1, 0]), 1), ((5, 3, [2]), 1), ((1, 0, []), 0)],
            'C08': [(([],), 0), (([[1, 3], [3, 5], [2, 4]],), 4), (([[1, 10], [2, 3]],), 9)],
            'C09': [(([[0]],), 0), (([[1]],), -1), (([[0, 1], [1, 0]],), -1), (([[0, 0, 0]],), 2)],
            'C10': [((1, []), 0), ((2, []), -1), ((2, [[1, 0, 1]]), -1), ((2, [[0, 0, 0], [0, 1, 3], [0, 1, 0]]), 0)],
        }
        for key, examples in cases.items():
            for args, expected in examples:
                with self.subTest(question=key, arguments=args):
                    self.assertEqual(self.functions[key](*args), expected)


if __name__ == '__main__':
    unittest.main()
