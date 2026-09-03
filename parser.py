import re
import json
import os
import html


class SourceFormatError(ValueError):
    """Raised when a source test cannot be converted without data loss."""


QUESTION_HEADER = re.compile(r'^##\s+(\d+)\.\s*(.+?)\s*$', re.MULTILINE)
OPTION_LINE = re.compile(r'^([A-Za-zА-Яа-яЁё])\)\s*(.*)$')
EXPLANATION_BLOCK = re.compile(r'\[\[(.*?)\]\]', re.DOTALL)
MANIFEST_FILE = '.generated-manifest.json'

def transliterate(name):
    """
    Transliterates a Russian string into a Latin string.
    """
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '_', '.': '', '-': '_', '(': '', ')': '', '?': '', '!': '', ',': '', ';': '', ':': ''
    }
    
    result = []
    # Convert the entire name to lowercase before transliteration to ensure lowercase filenames
    name_lower = name.lower()
    for char in name_lower:
        result.append(translit_map.get(char, char)) # Use get() with default char if not in map
    
    return "".join(result)

def parse_md_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title from filename (without extension) as a default.
    # A non-numbered level-two heading, when present, is the human-readable
    # topic title. This allows an explicit title to take precedence over the
    # source filename.
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    title = base_name.strip()
    topic_title_match = re.search(r'^##\s+(?!\d+\.\s)(.+?)\s*$', content, re.MULTILINE)
    if topic_title_match:
        title = topic_title_match.group(1).strip()

    headers = list(QUESTION_HEADER.finditer(content))
    if not headers:
        raise SourceFormatError(f"{file_path}: no questions in the form '## N. Question'.")

    questions_data = []
    for question_id, header in enumerate(headers, start=1):
        next_start = headers[question_id].start() if question_id < len(headers) else len(content)
        body = content[header.end():next_start]
        source_number = header.group(1)
        explanation_matches = EXPLANATION_BLOCK.findall(body)
        if len(explanation_matches) != 1:
            raise SourceFormatError(
                f"{file_path}, question {source_number}: exactly one [[explanation]] block is required."
            )
        explanation = explanation_matches[0].strip()
        if not explanation:
            raise SourceFormatError(f"{file_path}, question {source_number}: explanation cannot be empty.")

        without_explanation = EXPLANATION_BLOCK.sub('', body)
        question_lines = [header.group(2).strip()]
        option_lines = []
        options_started = False
        for raw_line in without_explanation.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            option_match = OPTION_LINE.match(line)
            if option_match:
                options_started = True
                option_lines.append(option_match.group(2).strip())
            elif options_started and (line == '---' or line.startswith('#')):
                continue
            elif options_started:
                raise SourceFormatError(
                    f"{file_path}, question {source_number}: unrecognised line after answer options: {line!r}."
                )
            else:
                question_lines.append(line)

        question_text = ' '.join(question_lines).strip()
        if not question_text:
            raise SourceFormatError(f"{file_path}, question {source_number}: question text cannot be empty.")

        fill_in_blanks_matches = re.findall(r'{(.+?)}', question_text)
        if fill_in_blanks_matches:
            if option_lines:
                raise SourceFormatError(
                    f"{file_path}, question {source_number}: a fill-in question cannot also contain options."
                )
            fill_in_blanks = []
            for raw_answers in fill_in_blanks_matches:
                answers = [answer.strip() for answer in raw_answers.split('|') if answer.strip()]
                if not answers:
                    raise SourceFormatError(
                        f"{file_path}, question {source_number}: every blank needs at least one accepted answer."
                    )
                fill_in_blanks.append(answers)
            questions_data.append({
                "id": question_id,
                "question": question_text,
                "multi": len(fill_in_blanks) > 1,
                "explanation": explanation,
                "options": [],
                "fill_in_blanks": fill_in_blanks,
            })
            continue

        if not option_lines:
            raise SourceFormatError(f"{file_path}, question {source_number}: no answer options found.")

        options = []
        for option_id, option_text_raw in enumerate(option_lines, start=1):
            is_correct = option_text_raw.endswith('**')
            option_text = option_text_raw[:-2].rstrip() if is_correct else option_text_raw
            if not option_text:
                raise SourceFormatError(
                    f"{file_path}, question {source_number}: an answer option cannot be empty."
                )
            options.append({"id": option_id, "text": option_text, "correct": is_correct})

        if not any(option['correct'] for option in options):
            raise SourceFormatError(
                f"{file_path}, question {source_number}: mark at least one correct option with **."
            )
        questions_data.append({
            "id": question_id,
            "question": question_text,
            "multi": sum(option['correct'] for option in options) > 1,
            "explanation": explanation,
            "options": options,
            "fill_in_blanks": [],
        })
    
    return {"title": title, "questions": questions_data}

def generate_html_test(test_data, output_path, prev_test_link, next_test_link, main_page_link):
    title = test_data['title']
    questions = test_data['questions']
    safe_title = html.escape(title)
    safe_quiz_data = json.dumps(test_data, ensure_ascii=False, indent=2).replace('</', '<\\/')

    html_content = f"""
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{safe_title}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }}
        h1 {{
            color: #0056b3;
            text-align: center;
            margin-bottom: 30px;
        }}
        .question-block {{
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }}
        .question-fieldset {{
            min-width: 0;
            margin: 0;
            padding: 0;
            border: 0;
        }}
        .question-text {{
            font-weight: bold;
            margin-bottom: 10px;
            line-height: 1.5;
            position: relative; /* For positioning the icon */
            padding-right: 30px; /* Add space for the icon */
            width: 100%;
            box-sizing: border-box;
        }}
        .question-status-icon {{
            position: absolute;
            top: 8px; /* Adjust vertical position */
            right: 8px; /* Adjust horizontal position */
            font-size: 1.2em;
            display: none; /* Hidden by default */
        }}
        .question-status-icon.correct {{
            color: #28a745; /* Green */
        }}
        .question-status-icon.incorrect {{
            color: #dc3545; /* Red */
        }}
        .options-list {{
            list-style: none;
            padding: 0;
            margin-top: 10px;
        }}
        .options-list li {{
            margin-bottom: 8px;
        }}
        .options-list label {{
            display: block;
            padding: 8px;
            border: 1px solid #eee;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }}
        .options-list label:hover {{
            background-color: #e9e9e9;
        }}
        .options-list label:focus-within {{
            outline: 2px solid #0056b3;
            outline-offset: 2px;
        }}
        input[type="radio"], input[type="checkbox"] {{
            margin-right: 10px;
        }}
        label.correct-answer {{ /* Corrected selector */
            background-color: #e6ffe6;
            border-color: #a3e6a3;
        }}
        label.incorrect-answer {{ /* Corrected selector */
            background-color: #ffe6e6;
            border-color: #e6a3a3;
        }}
        label.missed-correct-answer {{ /* New selector for not selected correct answers */
            border: 2px solid #28a745; /* Green border */
        }}
        .explanation-block {{
            margin-top: 15px;
            padding: 10px;
            background-color: #eaf2f8;
            border: 1px solid #cce7ff;
            border-radius: 5px;
            display: none; /* Hidden by default */
        }}
        .explanation-toggle {{
            cursor: pointer;
            color: #0056b3;
            text-decoration: underline;
            margin-top: 10px;
            display: block;
        }}
        .results-block {{
            margin-top: 30px;
            padding: 20px;
            border: 2px solid #0056b3;
            border-radius: 8px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            display: none;
        }}
        .buttons-container {{
            text-align: center;
            margin-top: 30px;
        }}
        .buttons-container button {{
            padding: 10px 20px;
            font-size: 1em;
            margin: 0 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }}
        .buttons-container button.check-button {{
            background-color: #28a745;
            color: white;
        }}
        .buttons-container button.check-button:hover {{
            background-color: #218838;
        }}
        .buttons-container button.reset-button {{
            background-color: #dc3545;
            color: white;
        }}
        .buttons-container button.reset-button:hover {{
            background-color: #c82333;
        }}
        .fill-in-blank-input {{
            border: 1px solid #ccc;
            padding: 5px;
            border-radius: 3px;
            width: 150px; /* Adjust as needed */
        }}
        .fill-in-blank-input.correct {{
            background-color: #e6ffe6;
            border-color: #a3e6a3;
        }}
        .fill-in-blank-input.incorrect {{
            background-color: #ffe6e6;
            border-color: #e6a3a3;
        }}
        .navigation-block {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 30px;
            padding: 10px 0;
            border-top: 1px solid #eee;
        }}
        .navigation-link {{
            color: #0056b3;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }}
        .navigation-link:hover {{
            background-color: #eaf2f8;
        }}
        .navigation-link.disabled {{
            color: #ccc;
            pointer-events: none;
            cursor: default;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{safe_title}</h1>
        <form id="quizForm">
            <!-- Questions will be rendered here by JavaScript -->
        </form>
        <div class="buttons-container">
            <button type="button" class="check-button" onclick="checkAnswers()">Проверить</button>
            <button type="button" class="reset-button" onclick="resetQuiz()">Сбросить</button>
        </div>
        <div id="results" class="results-block" role="status" aria-live="polite" aria-atomic="true">
            Ваш результат: <span id="score">0</span> из <span id="totalQuestions">0</span> (<span id="percentage">0</span>%)
        </div>

        <div class="navigation-block">
            {f'<a href="{prev_test_link}" class="navigation-link">Предыдущий тест</a>' if prev_test_link else ''}
            <a href="{main_page_link}" class="navigation-link">Все тесты</a>
            {f'<a href="{next_test_link}" class="navigation-link">Следующий тест</a>' if next_test_link else ''}
        </div>
    </div>

    <script>
        const quizData = {safe_quiz_data};

        document.addEventListener('DOMContentLoaded', () => {{
            renderQuiz();
        }});

        function appendQuestionText(container, question) {{
            const parts = question.split(/({{.*?}})/g);
            let blankIndex = 0;
            parts.forEach(part => {{
                if (/^{{.*}}$/.test(part)) {{
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'fill-in-blank-input';
                    input.dataset.blankIndex = String(blankIndex++);
                    input.setAttribute('aria-label', `Ответ на пропуск ${{blankIndex}}`);
                    container.appendChild(input);
                }} else {{
                    container.appendChild(document.createTextNode(part));
                }}
            }});
        }}

        function renderQuiz() {{
            const quizForm = document.getElementById('quizForm');
            quizForm.replaceChildren();
            quizData.questions.forEach(q => {{
                const questionBlock = document.createElement('div');
                questionBlock.className = 'question-block';
                questionBlock.dataset.questionId = String(q.id);

                const fieldset = document.createElement('fieldset');
                fieldset.className = 'question-fieldset';
                const legend = document.createElement('legend');
                legend.className = 'question-text';
                const questionNumber = document.createElement('span');
                questionNumber.textContent = `${{q.id}}. `;
                legend.appendChild(questionNumber);
                appendQuestionText(legend, q.question);
                legend.appendChild(document.createElement('br'));
                const hint = document.createElement('small');
                hint.textContent = q.multi ? '(Несколько правильных ответов)' : '(Один правильный ответ)';
                legend.appendChild(hint);
                const statusIcon = document.createElement('span');
                statusIcon.className = 'question-status-icon';
                statusIcon.setAttribute('aria-hidden', 'true');
                legend.appendChild(statusIcon);
                fieldset.appendChild(legend);

                if (q.options && q.options.length > 0) {{
                    const optionsList = document.createElement('ul');
                    optionsList.className = 'options-list';
                    q.options.forEach(opt => {{
                        const listItem = document.createElement('li');
                        const label = document.createElement('label');
                        const input = document.createElement('input');
                        input.type = q.multi ? 'checkbox' : 'radio';
                        input.name = `question-${{q.id}}`;
                        input.value = String(opt.id);
                        label.append(input, document.createTextNode(` ${{opt.text}}`));
                        listItem.appendChild(label);
                        optionsList.appendChild(listItem);
                    }});
                    fieldset.appendChild(optionsList);
                }}

                questionBlock.appendChild(fieldset);
                const explanationBlock = document.createElement('div');
                explanationBlock.className = 'explanation-block';
                explanationBlock.style.display = 'none';
                const explanationTitle = document.createElement('strong');
                explanationTitle.textContent = 'Пояснение: ';
                explanationBlock.append(explanationTitle, document.createTextNode(q.explanation));
                questionBlock.appendChild(explanationBlock);
                quizForm.appendChild(questionBlock);
            }});
            document.getElementById('totalQuestions').textContent = String(quizData.questions.length);
        }}

        function normalizeAnswer(value) {{
            return value
                .trim()
                .toLowerCase()
                .replace(/ё/g, 'е')
                .replace(/[–—]/g, '-')
                .replace(/\\s+/g, ' ')
                .replace(/[.!?]+$/g, '');
        }}

        function checkAnswers() {{
            let score = 0;
            let totalQuestions = quizData.questions.length;

            quizData.questions.forEach(q => {{
                const questionBlock = document.querySelector(`[data-question-id="${{q.id}}"]`);
                // Clear all previous styling on labels and inputs
                questionBlock.querySelectorAll('label').forEach(label => {{
                    label.classList.remove('correct-answer', 'incorrect-answer', 'missed-correct-answer');
                }});
                questionBlock.querySelectorAll('.fill-in-blank-input').forEach(input => {{
                    input.classList.remove('correct', 'incorrect');
                }});

                const explanationBlock = questionBlock.querySelector('.explanation-block');
                if (explanationBlock) explanationBlock.style.display = 'block';

                let isQuestionCorrectOverall = true; // Tracks if the entire question is answered correctly
                const statusIcon = questionBlock.querySelector('.question-status-icon');
                statusIcon.style.display = 'block'; // Show icon container

                if (q.fill_in_blanks && q.fill_in_blanks.length > 0) {{
                    const inputs = questionBlock.querySelectorAll('.fill-in-blank-input');
                    let allBlanksCorrect = true;
                    inputs.forEach((input, index) => {{
                        const userAnswer = normalizeAnswer(input.value);
                        const correctAnswersForBlank = q.fill_in_blanks[index].map(normalizeAnswer);

                        if (correctAnswersForBlank.includes(userAnswer)) {{
                            input.classList.add('correct');
                        }} else {{
                            input.classList.add('incorrect');
                            allBlanksCorrect = false;
                            isQuestionCorrectOverall = false; // Mark question as incorrect if any blank is wrong
                        }}
                    }});
                    if (allBlanksCorrect) {{
                        score++;
                    }}
                }} else if (q.options && q.options.length > 0) {{
                    const selectedInputs = Array.from(questionBlock.querySelectorAll(`input[name="question-${{q.id}}"]`));
                    const correctOptionIds = q.options.filter(opt => opt.correct).map(opt => String(opt.id));
                    if (correctOptionIds.length === 0) {{
                        isQuestionCorrectOverall = false;
                        return;
                    }}
                    
                    let userCorrectSelections = 0;
                    let userIncorrectSelections = 0;

                    selectedInputs.forEach(input => {{
                        const optionId = String(input.value);
                        const label = input.closest('label');

                        if (input.checked) {{
                            if (correctOptionIds.includes(optionId)) {{
                                label.classList.add('correct-answer');
                                userCorrectSelections++;
                            }} else {{
                                label.classList.add('incorrect-answer');
                                userIncorrectSelections++;
                                isQuestionCorrectOverall = false; // Mark question as incorrect if any wrong option is selected
                            }}
                        }} else {{ // If not selected
                            if (correctOptionIds.includes(optionId)) {{
                                // This is a correct answer that the user missed
                                label.classList.add('missed-correct-answer'); // Highlight with green border
                                isQuestionCorrectOverall = false;
                            }}
                        }}
                    }});

                    // Check if all correct options were selected and no incorrect ones were selected
                    if (userCorrectSelections === correctOptionIds.length && userIncorrectSelections === 0 && selectedInputs.filter(input => input.checked).length === correctOptionIds.length) {{
                        score++;
                    }} else {{
                        isQuestionCorrectOverall = false; // Ensure question is marked incorrect if not all conditions met
                    }}
                }}

                // Set question status icon
                if (isQuestionCorrectOverall) {{
                    statusIcon.textContent = '✓';
                    statusIcon.classList.add('correct');
                    statusIcon.classList.remove('incorrect');
                }} else {{
                    statusIcon.textContent = '✖';
                    statusIcon.classList.add('incorrect');
                    statusIcon.classList.remove('correct');
                }}
            }});
            document.getElementById('score').textContent = score;
            const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;
            document.getElementById('percentage').textContent = percentage;
            document.getElementById('results').style.display = 'block';
        }}

        function resetQuiz() {{
            const quizForm = document.getElementById('quizForm');
            quizForm.reset(); // Reset form inputs

            quizData.questions.forEach(q => {{
                const questionBlock = document.querySelector(`[data-question-id="${{q.id}}"]`);
                // Remove all result-related classes
                questionBlock.querySelectorAll('.options-list label').forEach(label => {{
                    label.classList.remove('correct-answer', 'incorrect-answer', 'missed-correct-answer');
                }});
                questionBlock.querySelectorAll('.fill-in-blank-input').forEach(input => {{
                    input.classList.remove('correct', 'incorrect');
                }});
                // Hide explanations
                if (questionBlock.querySelector('.explanation-block')) {{ // Check if explanation block exists
                    questionBlock.querySelector('.explanation-block').style.display = 'none';
                }}
                // Hide and clear status icon
                const statusIcon = questionBlock.querySelector('.question-status-icon');
                if (statusIcon) {{
                    statusIcon.style.display = 'none';
                    statusIcon.textContent = '';
                    statusIcon.classList.remove('correct', 'incorrect');
                }}
            }});
            document.getElementById('results').style.display = 'none';
            document.getElementById('score').textContent = '0';
            window.scrollTo(0, 0); // Scroll to top
        }}
    </script>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

def process_all_source_files(source_dir, json_dir, tests_dir):
    if not os.path.exists(json_dir):
        os.makedirs(json_dir)
    if not os.path.exists(tests_dir):
        os.makedirs(tests_dir)

    records = []
    slugs = {}
    for filename in sorted(os.listdir(source_dir)):
        if not filename.endswith((".md", ".txt")):
            continue
        file_path = os.path.join(source_dir, filename)
        parsed_data = parse_md_file(file_path)
        slug = transliterate(parsed_data["title"])
        if not slug:
            raise SourceFormatError(f"{file_path}: title cannot produce an empty filename.")
        if slug in slugs:
            raise SourceFormatError(
                f"{file_path}: title slug {slug!r} conflicts with {slugs[slug]!r}."
            )
        slugs[slug] = filename
        records.append({"source": file_path, "data": parsed_data, "slug": slug})

    records.sort(key=lambda record: record["data"]["title"].casefold())
    all_test_metadata = [
        {
            "title": record["data"]["title"],
            "filename": f'{record["slug"]}.html',
            "github_pages_link": f'tests/{record["slug"]}.html',
        }
        for record in records
    ]

    json_filenames = {f'{record["slug"]}.json' for record in records}
    html_filenames = {metadata["filename"] for metadata in all_test_metadata}
    manifest_path = os.path.join(os.path.dirname(os.path.normpath(source_dir)) or '.', MANIFEST_FILE)
    previous_manifest = {"json": [], "tests": []}
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as manifest_file:
            previous_manifest.update(json.load(manifest_file))

    for directory, category, current_files in (
        (json_dir, "json", json_filenames),
        (tests_dir, "tests", html_filenames),
    ):
        for stale_file in previous_manifest.get(category, []):
            if stale_file in current_files:
                continue
            stale_path = os.path.join(directory, stale_file)
            if os.path.isfile(stale_path):
                os.remove(stale_path)

    for record in records:
        json_output_path = os.path.join(json_dir, f'{record["slug"]}.json')
        with open(json_output_path, 'w', encoding='utf-8') as json_file:
            json.dump(record["data"], json_file, ensure_ascii=False, indent=2)

    for index, record in enumerate(records):
        prev_test_link = all_test_metadata[index - 1]["filename"] if index else None
        next_test_link = all_test_metadata[index + 1]["filename"] if index + 1 < len(records) else None
        html_output_path = os.path.join(tests_dir, all_test_metadata[index]["filename"])
        generate_html_test(record["data"], html_output_path, prev_test_link, next_test_link, "../index.html")

    with open(manifest_path, 'w', encoding='utf-8') as manifest_file:
        json.dump(
            {"json": sorted(json_filenames), "tests": sorted(html_filenames)},
            manifest_file,
            ensure_ascii=False,
            indent=2,
        )

    return all_test_metadata


def generate_catalog_html(test_metadata, output_path):
    safe_metadata = json.dumps(test_metadata, ensure_ascii=False, indent=2).replace('</', '<\\/')
    html_content = f"""
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Каталог тестов по фармакологии</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }}
        h1 {{
            color: #0056b3;
            text-align: center;
            margin-bottom: 30px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }}
        th {{
            background-color: #f2f2f2;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        a {{
            color: #0056b3;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Каталог тестов по фармакологии</h1>
        <table>
            <thead>
                <tr>
                    <th>Название темы</th>
                    <th>Название файла</th>
                    <th>Ссылка на тест</th>
                </tr>
            </thead>
            <tbody>
                <!-- Rows will be populated by JavaScript -->
            </tbody>
        </table>
    </div>
    <script>
        const testMetadata = {safe_metadata};
        const tbody = document.querySelector('table tbody');

        testMetadata.forEach(test => {{
            const row = tbody.insertRow();
            row.insertCell().textContent = test.title;
            row.insertCell().textContent = test.filename;
            const linkCell = row.insertCell();
            const link = document.createElement('a');
            link.href = test.github_pages_link;
            link.textContent = 'Перейти к тесту';
            linkCell.appendChild(link);
        }});
    </script>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

def generate_index_html(test_metadata, output_path):
    # Sort test_metadata alphabetically by title
    sorted_metadata = sorted(test_metadata, key=lambda x: x['title'])

    list_items = ""
    for test in sorted_metadata:
        filename = html.escape(test["filename"], quote=True)
        title = html.escape(test["title"])
        list_items += f'<li><a href="tests/{filename}">{title}</a></li>\n'

    html_content = f"""
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Главная страница тестов</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }}
        h1 {{
            color: #0056b3;
            text-align: center;
            margin-bottom: 30px;
        }}
        ul {{
            list-style: none;
            padding: 0;
        }}
        li {{
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }}
        li:last-child {{
            border-bottom: none;
        }}
        a {{
            color: #0056b3;
            text-decoration: none;
            font-size: 1.1em;
            display: block;
            padding: 5px 0;
        }}
        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
        <div class="container">
            <h1>Тесты по фармакологии для самоконтроля знаний</h1>
            <ul>
                {list_items}
            </ul>
        </div>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)


if __name__ == "__main__":
    SOURCE_DIR = "source/"
    JSON_DIR = "json/"
    TESTS_DIR = "tests/"
    
    # Process all files and generate JSONs and HTML tests
    print(f"Processing files from {SOURCE_DIR} and saving JSONs to {JSON_DIR} and HTML tests to {TESTS_DIR}...")
    test_metadata = process_all_source_files(SOURCE_DIR, JSON_DIR, TESTS_DIR)
    print("JSON and HTML test generation complete.")

    # Generate catalog.html
    catalog_output_path = "catalog.html"
    generate_catalog_html(test_metadata, catalog_output_path)
    print(f"Generated {catalog_output_path}")

    # Generate index.html
    index_output_path = "index.html"
    generate_index_html(test_metadata, index_output_path)
    print(f"Generated {index_output_path}")

    print("All tasks complete.")
