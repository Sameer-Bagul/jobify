import os
import re

APP_DIR = "jobify/app"
LIB_DIR = "jobify/lib"

def fix_use_client_and_duplicates(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content

    # 1. Add "use client"; if useState or useEffect are imported
    if "useState" in content or "useEffect" in content:
        if '"use client"' not in content and "'use client'" not in content:
            content = '"use client";\n\n' + content

    # 2. Fix multiple imports of useRouter / useParams
    # We will just find all imports from next/navigation and combine them, removing others
    nav_imports = set(re.findall(r"import\s*\{([^}]+)\}\s*from\s*['\"]next/navigation['\"]", content))
    if nav_imports:
        items = set()
        for block in nav_imports:
            for item in block.split(','):
                item = item.strip()
                if item:
                    items.add(item)
        
        # Remove all existing next/navigation imports
        content = re.sub(r"import\s*\{[^}]+\}\s*from\s*['\"]next/navigation['\"];?\n?", "", content)
        
        # Add combined import right after "use client";
        combined_import = f"import {{ {', '.join(sorted(items))} }} from 'next/navigation';\n"
        content = content.replace('"use client";', f'"use client";\n{combined_import}')

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

for root, dirs, files in os.walk(APP_DIR):
    for file in files:
        if file.endswith('.tsx'):
            fix_use_client_and_duplicates(os.path.join(root, file))

# 3. Fix ../config/env.js in utils
for root, dirs, files in os.walk(os.path.join(LIB_DIR, "utils")):
    for file in files:
        if file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            content = re.sub(r"from\s*['\"](\.\./)+config/env\.js['\"]", r"from '@/lib/utils/env'", content)
            content = re.sub(r"from\s*['\"](\.\./)+config/env['\"]", r"from '@/lib/utils/env'", content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Fixed use client, duplicates and env paths!")
