import os
import re

APP_DIR = "jobify/app"
LIB_DIR = "jobify/lib"

def fix_react_router(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove empty imports from react-router-dom
    content = re.sub(r"import\s*\{\s*\}\s*from\s*['\"]react-router-dom['\"];?\n?", "", content)
    # Also for next/navigation
    content = re.sub(r"import\s*\{\s*\}\s*from\s*['\"]next/navigation['\"];?\n?", "", content)

    # Fix @/lib/utils/api to @/lib/api
    content = content.replace("from '@/lib/utils/api'", "from '@/lib/api'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(APP_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_react_router(os.path.join(root, file))

# Fix .js in models and utils
for directory in [os.path.join(LIB_DIR, "models"), os.path.join(LIB_DIR, "utils")]:
    if os.path.exists(directory):
        for file in os.listdir(directory):
            if file.endswith('.ts'):
                path = os.path.join(directory, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                content = re.sub(r"from\s*['\"]([^'\"]+)\.js['\"]", r"from '\1'", content)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Fixed remaining build errors!")
