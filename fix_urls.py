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
    
    if 'API_BASE_URL' not in content:
        content = 'import { API_BASE_URL } from "../services/api.js";\n' + content
        
    content = content.replace('const API_BASE_URL = `http://${window.location.hostname}:8000`;', '')
    content = content.replace('http://127.0.0.1:8000', '${API_BASE_URL}')
    
    # fix strings that get accidentally wrapped: "`${API_BASE_URL}" -> "`${API_BASE_URL}`"
    # Actually, we should just run a generic replace for standard string wrappers:
    content = content.replace('"${API_BASE_URL}', '`${API_BASE_URL}')
    content = content.replace('${API_BASE_URL}"', '${API_BASE_URL}`')
    
    content = content.replace('\'${API_BASE_URL}', '`${API_BASE_URL}')
    content = content.replace('${API_BASE_URL}\'', '${API_BASE_URL}`')
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
