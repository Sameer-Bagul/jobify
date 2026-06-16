import os
import re

APP_DIR = "jobify/app"

def fix_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace relative paths to lib/api with @/lib/api
    content = re.sub(r"from '(\.\./)+lib/api'", "from '@/lib/api'", content)
    content = re.sub(r"from '(\.\./)+store/auth'", "from '@/store/auth'", content)
    content = re.sub(r"from '(\.\./)+store/admin'", "from '@/store/admin'", content)
    content = re.sub(r"from '(\.\./)+components/([^']+)'", r"from '@/components/\2'", content)
    content = re.sub(r"from '(\.\./)+utils/([^']+)'", r"from '@/lib/utils/\2'", content)
    # Also fix anything like '../../store/auth'
    content = re.sub(r"from '(\./)+components/([^']+)'", r"from '@/components/\2'", content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(APP_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_imports(os.path.join(root, file))

print("Fixed imports in all app files!")
