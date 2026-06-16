import os
import re

CLIENT_PAGES_DIR = "client/src/pages"
APP_DIR = "jobify/app"

ROUTES_MAP = {
    "Landing.tsx": "page.tsx",
    "Login.tsx": "(auth)/login/page.tsx",
    "Signup.tsx": "(auth)/signup/page.tsx",
    "ForgotPassword.tsx": "(auth)/forgot-password/page.tsx",
    "Onboarding.tsx": "onboarding/page.tsx",
    "Dashboard.tsx": "dashboard/page.tsx",
    "Jobs.tsx": "jobs/page.tsx",
    "JobDetail.tsx": "jobs/[id]/page.tsx",
    "Saved.tsx": "saved/page.tsx",
    "Email.tsx": "email/page.tsx",
    "Subscription.tsx": "subscription/page.tsx",
    "Account.tsx": "account/page.tsx",
    
    # Recruiter
    "recruiter/Dashboard.tsx": "dashboard/recruiter/page.tsx",
    "recruiter/Jobs.tsx": "dashboard/recruiter/jobs/page.tsx",
    "recruiter/PostJob.tsx": "dashboard/recruiter/post-job/page.tsx",
    "recruiter/Candidates.tsx": "dashboard/recruiter/candidates/page.tsx",
    "recruiter/Account.tsx": "dashboard/recruiter/account/page.tsx",
    
    # Admin
    "admin/Dashboard.tsx": "dashboard/admin/page.tsx",
    "admin/Users.tsx": "dashboard/admin/users/page.tsx",
    "admin/Jobs.tsx": "dashboard/admin/jobs/page.tsx",
    "admin/EmailLogs.tsx": "dashboard/admin/email-logs/page.tsx",
    "admin/Recruiters.tsx": "dashboard/admin/recruiters/page.tsx",
    "admin/Settings.tsx": "dashboard/admin/settings/page.tsx",
}

def migrate_file(src_rel_path, dest_rel_path):
    src_path = os.path.join(CLIENT_PAGES_DIR, src_rel_path)
    dest_path = os.path.join(APP_DIR, dest_rel_path)
    
    if not os.path.exists(src_path):
        print(f"Source file not found: {src_path}")
        return
        
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    # 1. react-router-dom Link -> next/link
    content = re.sub(r"import \{([^}]*)\bLink\b([^}]*)\} from 'react-router-dom';", 
                     r"import {\1\2} from 'react-router-dom';\nimport Link from 'next/link';", content)
    content = re.sub(r"import \{ Link \} from 'react-router-dom';\n?", "import Link from 'next/link';\n", content)
    
    # 2. useNavigate -> useRouter
    content = re.sub(r"\buseNavigate\b", "useRouter", content)
    
    # Replace useLocation -> usePathname
    content = re.sub(r"\buseLocation\b", "usePathname", content)
    
    # 3. Replace import { ..., useNavigate, ... } from 'react-router-dom' with next/navigation
    if 'useRouter' in content or 'useParams' in content or 'usePathname' in content:
        # Just clean up react-router-dom and add next/navigation
        content = re.sub(r"import\s*\{([^}]*)\}\s*from\s*'react-router-dom';", "", content)
        nav_imports = []
        if 'useRouter' in content: nav_imports.append("useRouter")
        if 'useParams' in content: nav_imports.append("useParams")
        if 'usePathname' in content: nav_imports.append("usePathname")
        if 'useSearchParams' in content: nav_imports.append("useSearchParams")
        if nav_imports:
            content = f"import {{ {', '.join(nav_imports)} }} from 'next/navigation';\n" + content

    # 4. Link to="..." -> Link href="..."
    content = re.sub(r"<Link([^>]+)to=", r"<Link\1href=", content)
    
    # 5. navigate(...) -> router.push(...)
    content = re.sub(r"navigate\(", r"router.push(", content)
    
    # location.pathname -> pathname
    content = re.sub(r"location\.pathname", r"pathname", content)

    # Convert const navigate = useRouter() -> const router = useRouter()
    content = content.replace("const navigate = useRouter()", "const router = useRouter()")

    # Add "use client" if it's not there and uses hooks
    if 'use client' not in content:
        content = '"use client";\n\n' + content
        
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Migrated {src_rel_path} -> {dest_rel_path}")

for src, dest in ROUTES_MAP.items():
    migrate_file(src, dest)
