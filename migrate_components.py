import os
import re

DIRS = ["jobify/components", "jobify/app"]

def migrate_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Replacements
    # 1. react-router-dom Link -> next/link
    content = re.sub(r"import \{([^}]*)\bLink\b([^}]*)\} from 'react-router-dom';", 
                     r"import {\1\2} from 'react-router-dom';\nimport Link from 'next/link';", content)
    content = re.sub(r"import \{ Link \} from 'react-router-dom';\n?", "import Link from 'next/link';\n", content)
    
    # 2. useNavigate -> useRouter
    content = re.sub(r"\buseNavigate\b", "useRouter", content)
    
    # 3. useLocation -> usePathname
    content = re.sub(r"\buseLocation\b", "usePathname", content)
    
    # 4. useParams -> useParams from next/navigation
    # Replace import { ..., useRouter, ... } from 'react-router-dom' with next/navigation
    if 'useRouter' in content or 'useParams' in content or 'usePathname' in content:
        # Just clean up react-router-dom and add next/navigation
        content = re.sub(r"import \{([^}]*)\} from 'react-router-dom';", "", content)
        nav_imports = []
        if 'useRouter' in content: nav_imports.append("useRouter")
        if 'useParams' in content: nav_imports.append("useParams")
        if 'usePathname' in content: nav_imports.append("usePathname")
        if nav_imports:
            content = f"import {{ {', '.join(nav_imports)} }} from 'next/navigation';\n" + content

    # 4. Link to="..." -> Link href="..."
    content = re.sub(r"<Link([^>]+)to=", r"<Link\1href=", content)
    
    # 5. navigate(...) -> router.push(...)
    content = re.sub(r"navigate\(", r"router.push(", content)
    
    # 6. location.pathname -> pathname
    content = re.sub(r"location\.pathname", r"pathname", content)

    if original != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Migrated components in {file_path}")

for directory in DIRS:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                migrate_file(os.path.join(root, file))
