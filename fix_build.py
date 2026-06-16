import os
import re

APP_DIR = "jobify/app"

def fix_empty_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    content = re.sub(r"import\s*\{\s*\}\s*from\s*'react-router-dom';\n?", "", content)
    content = re.sub(r"import\s*\{\s*\}\s*from\s*'next/navigation';\n?", "", content)
    
    # Also in email/page.tsx: import { useSearchParams } from 'react-router-dom' -> next/navigation
    content = re.sub(r"import\s*\{\s*useSearchParams\s*\}\s*from\s*'react-router-dom';", 
                     r"import { useSearchParams } from 'next/navigation';", content)

    if original != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed empty imports in {file_path}")

for root, dirs, files in os.walk(APP_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_empty_imports(os.path.join(root, file))

# Fix in lib/models/index.ts and other files
MODELS_DIR = "jobify/lib/models"
if os.path.exists(MODELS_DIR):
    for file in os.listdir(MODELS_DIR):
        if file.endswith('.ts'):
            path = os.path.join(MODELS_DIR, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            # replace .js with nothing in imports
            content = re.sub(r"from\s*'([^']+)\.js'", r"from '\1'", content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

UTILS_DIR = "jobify/lib/utils"
if os.path.exists(UTILS_DIR):
    for file in os.listdir(UTILS_DIR):
        if file.endswith('.ts'):
            path = os.path.join(UTILS_DIR, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            content = re.sub(r"from\s*'([^']+)\.js'", r"from '\1'", content)
            # fix env import path: env was in server/src/config/env.js but we changed it to @/lib/utils/env ?
            content = re.sub(r"from\s*'(\.\./)+config/env(\.js)?'", r"from '@/lib/utils/env'", content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
