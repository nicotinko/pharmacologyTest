import json
import sys
import tempfile
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPOSITORY_ROOT))

from parser import SourceFormatError, generate_html_test, parse_md_file, process_all_source_files


VALID_QUESTION = """## 1. Выберите верный ответ
а) Верный вариант**
б) Неверный вариант
[[Первая строка пояснения.
Вторая строка пояснения.]]
"""


class ParserTests(unittest.TestCase):
    def write_source(self, directory, filename, content):
        path = Path(directory) / filename
        path.write_text(content, encoding="utf-8")
        return path

    def test_parses_lowercase_cyrillic_options_and_multiline_explanation(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            source = self.write_source(temporary_directory, "Тема.md", "## Тема\n\n" + VALID_QUESTION)
            data = parse_md_file(source)

        self.assertEqual(data["title"], "Тема")
        self.assertEqual(len(data["questions"]), 1)
        self.assertEqual(data["questions"][0]["options"][0]["text"], "Верный вариант")
        self.assertTrue(data["questions"][0]["options"][0]["correct"])
        self.assertIn("Вторая строка", data["questions"][0]["explanation"])

    def test_rejects_multiple_choice_without_a_correct_option(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            source = self.write_source(
                temporary_directory,
                "Тема.md",
                "## Тема\n\n## 1. Вопрос\na) Вариант\n[[Пояснение.]]\n",
            )
            with self.assertRaises(SourceFormatError):
                parse_md_file(source)

    def test_build_uses_title_slug_not_source_filename(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            source_dir = root / "source"
            json_dir = root / "json"
            tests_dir = root / "tests"
            source_dir.mkdir()
            self.write_source(source_dir, "ne-sovpadaet.md", "## Русское название\n\n" + VALID_QUESTION)

            metadata = process_all_source_files(source_dir, json_dir, tests_dir)

            self.assertEqual(metadata[0]["filename"], "russkoe_nazvanie.html")
            self.assertTrue((json_dir / "russkoe_nazvanie.json").exists())
            self.assertTrue((tests_dir / "russkoe_nazvanie.html").exists())

    def test_manifest_removes_only_previously_generated_stale_files(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            source_dir = root / "source"
            json_dir = root / "json"
            tests_dir = root / "tests"
            source_dir.mkdir()
            first_source = self.write_source(source_dir, "first.md", "## Первая\n\n" + VALID_QUESTION)
            process_all_source_files(source_dir, json_dir, tests_dir)
            first_source.unlink()
            self.write_source(source_dir, "second.md", "## Вторая\n\n" + VALID_QUESTION)
            user_file = tests_dir / "manual.html"
            user_file.write_text("manual", encoding="utf-8")

            process_all_source_files(source_dir, json_dir, tests_dir)

            self.assertFalse((json_dir / "pervaya.json").exists())
            self.assertFalse((tests_dir / "pervaya.html").exists())
            self.assertTrue((json_dir / "vtoraya.json").exists())
            self.assertTrue((tests_dir / "manual.html").exists())
            manifest = json.loads((root / ".generated-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["tests"], ["vtoraya.html"])

    def test_generated_html_uses_safe_dom_rendering_and_accessibility_metadata(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "test.html"
            generate_html_test(
                {
                    "title": "Тест </script><img>",
                    "questions": [
                        {
                            "id": 1,
                            "question": "Вопрос <b>\n{ответ}",
                            "multi": False,
                            "explanation": "Пояснение <img>",
                            "options": [],
                            "fill_in_blanks": [["ответ"]],
                        }
                    ],
                },
                output,
                None,
                None,
                "../index.html",
            )
            generated = output.read_text(encoding="utf-8")

        self.assertIn('aria-live="polite"', generated)
        self.assertIn("question-fieldset", generated)
        self.assertNotIn("innerHTML", generated)
        self.assertNotIn("</script><img>", generated)


if __name__ == "__main__":
    unittest.main(verbosity=2)
