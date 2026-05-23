import re
import json
import os

def transliterate(name):
    """
    Transliterates a Russian string into a Latin string.
    """
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 'с', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
        ' ': '_', '.': '', '-': '_', '(': '', ')': '', '?': '', '!': '', ',': '', ';': '', ':': ''
    }
    result = []
    for char in name:
        result.append(translit_map.get(char, char))
    return "".join(result)

def parse_md_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title from filename (without extension) as a default
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    title = base_name.strip()

    questions_data = []
    current_question = None
    question_id_counter = 1

    # Split content by '## N.' for each question
    question_blocks = re.split(r'## \d+\.\s*', content)
    # The first element is usually the file title/header, skip it.
    if question_blocks and question_blocks[0].strip() and not re.match(r'## \d+\.\s*', question_blocks[0]): # If first block contains title not a question
         question_blocks = question_blocks[1:] # Skip title part
    else: 
        pass # Keep all blocks if no title was split off or if it was a question (handled by `re.split` itself)


    for block in question_blocks:
        if not block.strip():
            continue

        q_lines = block.strip().split('\n')
        question_text = ""
        options = []
        correct_options_text = []
        fill_in_blanks = []
        
        # Check for fill-in-the-blanks question
        fill_in_blanks_matches = re.findall(r'{(.+?)}', q_lines[0])
        if fill_in_blanks_matches:
            question_text = q_lines[0].strip()
            all_fill_in_blanks_options = []
            for match in fill_in_blanks_matches:
                fill_in_blanks_raw = match.split('|')
                all_fill_in_blanks_options.append([s.strip() for s in fill_in_blanks_raw])
            
            # For fill-in-the-blanks, 'multi' means multiple blanks to fill, not multiple choice
            # For simplicity in initial implementation, we'll keep multi as False and assume each blank is a separate check
            
            # Extract explanation for fill-in-the-blanks
            explanation = ""
            explanation_match = re.search(r'\[\[(.*?)\]\]', block, re.DOTALL)
            if explanation_match:
                explanation = explanation_match.group(1).strip()
                # Remove explanation from question_text if it was mistakenly included
                question_text = re.sub(r'\[\[.*?\]\]', '', question_text).strip()

            questions_data.append({
                "id": question_id_counter,
                "question": question_text,
                "multi": len(all_fill_in_blanks_options) > 1, # True if more than one blank
                "explanation": explanation, # Use extracted explanation
                "options": [],
                "fill_in_blanks": all_fill_in_blanks_options # List of lists for multiple blanks
            })
            question_id_counter += 1
            continue

        # For multiple choice questions
        question_text = q_lines[0].strip()
        options_start_index = 1
        
        # Check if the question text itself contains an explanation for single line questions
        explanation_match_in_qtext = re.search(r'\[\[(.*?)\]\]', question_text)
        if explanation_match_in_qtext:
            explanation = explanation_match_in_qtext.group(1).strip()
            question_text = re.sub(r'\[\[.*?\]\]', '', question_text).strip()
        else:
            explanation = ""

        option_id_counter = 1
        for line_idx, line in enumerate(q_lines[options_start_index:]):
            line = line.strip()
            if not line:
                continue
            
            # Check for explanation after options
            explanation_match_after_options = re.match(r'\[\[(.*?)\]\]', line, re.DOTALL)
            if explanation_match_after_options:
                explanation = explanation_match_after_options.group(1).strip()
                break # Stop processing lines as options once explanation is found

            option_match = re.match(r'^[a-zА-Я]\)\s*(.*)', line)
            if option_match:
                option_text_raw = option_match.group(1)
                is_correct = option_text_raw.endswith('**')
                option_text = option_text_raw.replace('**', '').strip()
                options.append({"id": option_id_counter, "text": option_text, "correct": is_correct})
                if is_correct:
                    correct_options_text.append(option_text)
                option_id_counter += 1

        if question_text and options:
            multi_choice = sum(1 for opt in options if opt['correct']) > 1
            questions_data.append({
                "id": question_id_counter,
                "question": question_text,
                "multi": multi_choice,
                "explanation": explanation, # Use extracted explanation
                "options": options,
                "fill_in_blanks": []
            })
            question_id_counter += 1
    
    return {"title": title, "questions": questions_data}

def generate_html_test(test_data, output_path):
    title = test_data['title']
    questions = test_data['questions']

    html_content = f"""
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
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
        .question-text {{
            font-weight: bold;
            margin-bottom: 10px;
            line-height: 1.5;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>{title}</h1>
        <form id="quizForm">
            <!-- Questions will be rendered here by JavaScript -->
        </form>
        <div class="buttons-container">
            <button type="button" class="check-button" onclick="checkAnswers()">Проверить</button>
            <button type="button" class="reset-button" onclick="resetQuiz()">Сбросить</button>
        </div>
        <div id="results" class="results-block">
            Ваш результат: <span id="score">0</span> из <span id="totalQuestions">0</span> (<span id="percentage">0</span>%)
        </div>
    </div>

    <script>
        const quizData = {json.dumps(test_data, ensure_ascii=False, indent=2)};

        document.addEventListener('DOMContentLoaded', () => {{
            renderQuiz();
        }});

        function renderQuiz() {{
            const quizForm = document.getElementById('quizForm');
            quizForm.innerHTML = ''; // Clear previous questions
            quizData.questions.forEach(q => {{
                const questionBlock = document.createElement('div');
                questionBlock.classList.add('question-block');
                questionBlock.setAttribute('data-question-id', q.id);

                const questionText = document.createElement('p');
                questionText.classList.add('question-text');
                
                let qTextHtml = q.question;
                if (q.fill_in_blanks && q.fill_in_blanks.length > 0) {{
                    let blankIndex = 0;
                    qTextHtml = q.question.replace(/{{.*?}}/g, () => {{
                        return `<input type="text" class="fill-in-blank-input" data-blank-index="${{blankIndex++}}" />`;
                    }});
                }}
                questionText.innerHTML = `<span>${{q.id}}. ${{qTextHtml}}</span> <br> <small>(${{q.multi ? 'Несколько правильных ответов' : 'Один правильный ответ'}})</small>`;
                questionBlock.appendChild(questionText);

                if (q.options && q.options.length > 0) {{
                    const optionsList = document.createElement('ul');
                    optionsList.classList.add('options-list');
                    q.options.forEach(opt => {{
                        const listItem = document.createElement('li');
                        const inputType = q.multi ? 'checkbox' : 'radio';
                        const inputName = `question-${{q.id}}`;
                        
                        listItem.innerHTML = `
                            <label>
                                <input type="${{inputType}}" name="${{inputName}}" value="${{opt.id}}">
                                ${{opt.text}}
                            </label>
                        `;
                        optionsList.appendChild(listItem);
                    }});
                questionBlock.appendChild(optionsList);
                }}

                if (q.explanation) {{ // Only create explanation block if explanation exists
                    const explanationBlock = document.createElement('div');
                    explanationBlock.classList.add('explanation-block');
                    explanationBlock.style.display = 'none'; // Initially hidden, will be shown on check
                    explanationBlock.innerHTML = `<strong>Объяснение:</strong> ${{q.explanation}}`;
                    questionBlock.appendChild(explanationBlock);
                }}

                quizForm.appendChild(questionBlock);
            }});
            document.getElementById('totalQuestions').textContent = quizData.questions.length;
        }}

        function checkAnswers() {{
            let score = 0;
            let totalQuestions = quizData.questions.length;

            quizData.questions.forEach(q => {{
                const questionBlock = document.querySelector(`[data-question-id="${{q.id}}"]`);
                // Clear all previous styling on labels and inputs
                questionBlock.querySelectorAll('label').forEach(label => {{
                    label.classList.remove('correct-answer', 'incorrect-answer');
                }});
                questionBlock.querySelectorAll('.fill-in-blank-input').forEach(input => {{
                    input.classList.remove('correct', 'incorrect');
                }});

                // Show explanation block after check, only if explanation exists
                if (q.explanation) {{
                    const explanationBlock = questionBlock.querySelector('.explanation-block');
                    explanationBlock.style.display = 'block'; 
                }}

                let isQuestionCorrectOverall = true; // Tracks if the entire question is answered correctly

                if (q.fill_in_blanks && q.fill_in_blanks.length > 0) {{
                    const inputs = questionBlock.querySelectorAll('.fill-in-blank-input');
                    let allBlanksCorrect = true;
                    inputs.forEach((input, index) => {{
                        const userAnswer = input.value.trim().toLowerCase();
                        const correctAnswersForBlank = q.fill_in_blanks[index].map(ans => ans.toLowerCase());

                        if (correctAnswersForBlank.includes(userAnswer)) {{
                            input.classList.add('correct');
                        }} else {{
                            input.classList.add('incorrect');
                            allBlanksCorrect = false;
                        }}
                    }});
                    if (allBlanksCorrect) {{
                        score++;
                    }}
                }} else if (q.options && q.options.length > 0) {{
                    const selectedInputs = Array.from(questionBlock.querySelectorAll(`input[name="question-${{q.id}}"]`));
                    const correctOptionIds = q.options.filter(opt => opt.correct).map(opt => String(opt.id));
                    
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
                    }}
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

    all_test_metadata = []

    for filename in os.listdir(source_dir):
        if filename.endswith(".md") or filename.endswith(".txt"):
            file_path = os.path.join(source_dir, filename)
            
            # Parse the file
            parsed_data = parse_md_file(file_path)

            # Generate JSON output path
            json_filename = transliterate(parsed_data["title"]) + ".json"
            json_output_path = os.path.join(json_dir, json_filename)

            with open(json_output_path, 'w', encoding='utf-8') as f:
                json.dump(parsed_data, f, ensure_ascii=False, indent=2)
            
            # Generate HTML test file
            html_filename = transliterate(parsed_data["title"]) + ".html"
            html_output_path = os.path.join(tests_dir, html_filename)
            generate_html_test(parsed_data, html_output_path)

            all_test_metadata.append({
                "title": parsed_data["title"],
                "filename": html_filename,
                "github_pages_link": f"https://nicotinko.github.io/FarmacologyTest/tests/{html_filename}"
            })
    return all_test_metadata


def generate_catalog_html(test_metadata, output_path):
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
        const testMetadata = {json.dumps(test_metadata, ensure_ascii=False, indent=2)};
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
        list_items += f'<li><a href="tests/{test["filename"]}">{test["title"]}</a></li>\n'

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
        <h1>Добро пожаловать в тесты по фармакологии!</h1>
        <p>Выберите тему для прохождения теста:</p>
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