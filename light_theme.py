import os
import re

def replace_in_file(path):
    with open(path, 'r') as f:
        content = f.read()

    original = content

    # Backgrounds
    content = content.replace("bg-dark-950", "bg-gray-50")
    content = content.replace("bg-dark-900", "bg-white")
    content = content.replace("bg-dark-800", "bg-gray-100")
    content = content.replace("bg-dark-700", "bg-gray-200")
    
    # Text colors
    content = content.replace("text-pearl-beige", "text-dark-walnut")
    content = content.replace("text-peach-fuzz/70", "text-gray-500")
    content = content.replace("text-peach-fuzz", "text-gray-600")
    content = content.replace("text-gray-400", "text-gray-600")
    content = content.replace("text-gray-300", "text-gray-700")
    content = content.replace("text-gray-200", "text-dark-walnut")
    
    # Borders
    content = content.replace("border-olive-bark/30", "border-gray-200")
    content = content.replace("border-olive-bark/50", "border-gray-200")
    content = content.replace("border-olive-bark", "border-gray-300")
    
    # Specific hover effects
    content = content.replace("hover:bg-dark-800", "hover:bg-gray-50")
    content = content.replace("hover:bg-dark-700", "hover:bg-gray-100")
    content = content.replace("hover:border-olive-bark/60", "hover:border-gray-300")
    
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Applied light theme to {path}")

base_dir = 'jobify'
for root, _, files in os.walk(base_dir):
    # skip node_modules
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            replace_in_file(path)
