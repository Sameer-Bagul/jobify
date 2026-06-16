import os
import re

def replace_in_file(path):
    with open(path, 'r') as f:
        content = f.read()

    original = content

    # Colors
    content = content.replace("from-purple-900/40", "from-dark-walnut/40")
    content = content.replace("via-blue-900/20", "via-olive-bark/20")
    content = content.replace("from-purple-600", "from-cayenne-red")
    content = content.replace("to-blue-600", "to-tangerine-dream")
    content = content.replace("rgba(139,92,246,0.3)", "rgba(232,92,13,0.3)")
    content = content.replace("text-purple-400", "text-tangerine-dream")
    content = content.replace("text-purple-500", "text-tangerine-dream")
    content = content.replace("border-purple-500/20", "border-tangerine-dream/20")
    content = content.replace("border-purple-500/30", "border-tangerine-dream/30")
    content = content.replace("decoration-purple-500/30", "decoration-tangerine-dream/30")
    content = content.replace("hover:decoration-purple-500", "hover:decoration-tangerine-dream")
    content = content.replace("bg-purple-600/10", "bg-cayenne-red/10")
    content = content.replace("bg-blue-600/5", "bg-tangerine-dream/5")
    content = content.replace("bg-purple-500/30", "bg-tangerine-dream/30")

    # Copywriting
    content = content.replace("AI-powered recruiter outreach sequences", "Smart automated recruiter outreach sequences")
    content = content.replace("AI-powered skill gap analysis", "Comprehensive skill gap analysis")
    content = content.replace("AI Resume Tailoring", "Dynamic Resume Tailoring")
    content = content.replace("Our AI scans thousands of listings", "Our intelligent algorithm scans thousands of listings")
    content = content.replace("world's first AI-powered job search platform", "world's premier automated job search platform")
    content = content.replace("Redefining the job search experience with AI-first automation", "Redefining the job search experience with advanced workflow automation")
    content = content.replace("Get the latest career tips & AI updates", "Get the latest career tips & automation updates")
    content = content.replace("Let our AI understand your unique value", "Let our advanced system understand your unique value")
    content = content.replace("use our AI to find the best talent match", "use our smart-matching to find the best talent match")

    # Icon Replacements:
    # login/page.tsx already has Target from previous attempt, but let's do regex for generic Sparkles
    content = re.sub(r'<Sparkles\b', r'<Target', content)
    content = content.replace("Sparkles", "Target") # for imports

    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

# Run replacement over all tsx files in app and components
base_dir = 'jobify'
for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            replace_in_file(path)
