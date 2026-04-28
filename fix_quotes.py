import os

files = [
    'frontend/src/components/CodeEditor.jsx',
    'frontend/src/components/Dashboard.jsx',
    'frontend/src/components/Login.jsx',
    'frontend/src/components/Register.jsx'
]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's just fix the mismatched quotes literally.
    # From looking at the logs, we have strings like `${API_BASE_URL}/ai/suggest"
    content = content.replace('${API_BASE_URL}/ai/suggest"', '${API_BASE_URL}/ai/suggest`')
    content = content.replace('${API_BASE_URL}/auth/register\'', '${API_BASE_URL}/auth/register`')
    content = content.replace('${API_BASE_URL}/documents/"', '${API_BASE_URL}/documents/`')
    content = content.replace('${API_BASE_URL}/ai/chat"', '${API_BASE_URL}/ai/chat`')
    content = content.replace('${API_BASE_URL}/code/run"', '${API_BASE_URL}/code/run`')
    content = content.replace('${API_BASE_URL}/documents/join"', '${API_BASE_URL}/documents/join`')
    content = content.replace('${API_BASE_URL}/auth/login"', '${API_BASE_URL}/auth/login`')
    content = content.replace('${API_BASE_URL}/documents/join"', '${API_BASE_URL}/documents/join`')
    
    # Let's fix ALL instances where a string starts with `${API_BASE_URL} and ends with " or '
    import re
    # Match `${API_BASE_URL}...something..." and replace the trailing " with `
    content = re.sub(r'(\$\{API_BASE_URL\}[^\`\'\"]*)\"', r'\1`', content)
    # Same for single quotes
    content = re.sub(r'(\$\{API_BASE_URL\}[^\`\'\"]*)\'', r'\1`', content)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
