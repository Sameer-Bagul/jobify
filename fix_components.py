import os
import re

for directory in ['jobify/components', 'jobify/app']:
    for root, dirs, files in os.walk(directory):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                path = os.path.join(root, f)
                with open(path, 'r') as file:
                    content = file.read()
                
                # Remove empty react router imports
                new_content = re.sub(r"import\s*\{\s*\}\s*from\s*['\"]react-router-dom['\"];?\n?", "", content)
                
                # specific fix for app/email/page.tsx useSearchParams
                new_content = new_content.replace('const [searchParams] = useSearchParams();', 'const searchParams = useSearchParams();')
                new_content = new_content.replace('import { useSearchParams } from \'react-router-dom\'', 'import { useSearchParams } from \'next/navigation\'')
                
                # Add 'use client' if next/navigation is imported
                if 'next/navigation' in new_content and '"use client"' not in new_content and "'use client'" not in new_content:
                    new_content = '"use client";\n' + new_content
                    
                # specific fix for ProtectedRoute duplicate imports
                new_content = new_content.replace('import { useRouter, usePathname } from \'next/navigation\';\n"use client";\n', '"use client";\n')
                
                # specific fix for Sidebar.tsx
                new_content = new_content.replace('const location = usePathname();\n  const navigate = useRouter();', 'const pathname = usePathname();\n  const router = useRouter();')
                
                # specific fix for router.push(-1)
                new_content = new_content.replace('router.push(-1)', 'router.back()')
                
                if new_content != content:
                    with open(path, 'w') as file:
                        file.write(new_content)
                    print(f"Fixed {path}")
