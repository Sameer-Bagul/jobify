import os
import re

def replace_in_file(path):
    with open(path, 'r') as f:
        content = f.read()

    original = content

    # Delete massive blurred orbs (e.g. <div className="absolute ... blur-[120px]" />)
    # This regex looks for self-closing divs or full divs with blur-[...] and removes them entirely.
    content = re.sub(r'<div[^>]*blur-\[\d+px\][^>]*/>', '', content)
    content = re.sub(r'<div[^>]*blur-\[\d+px\][^>]*>.*?</div>', '', content, flags=re.DOTALL)
    
    # Delete gradient meshes
    content = re.sub(r'<div[^>]*bg-gradient-mesh[^>]*/>', '', content)
    content = re.sub(r'<div[^>]*bg-gradient-mesh[^>]*>.*?</div>', '', content, flags=re.DOTALL)

    # Color mappings
    content = content.replace("border-white/10", "border-olive-bark/30")
    content = content.replace("border-white/5", "border-olive-bark/30")
    
    # Text colors
    content = content.replace("text-gray-400", "text-peach-fuzz")
    content = content.replace("text-gray-500", "text-peach-fuzz/70")
    content = content.replace("text-white", "text-pearl-beige")
    
    # Backgrounds
    content = content.replace("bg-dark-950", "bg-dark-950")
    
    # Hardcoded purples/blues/pinks (just in case they slipped through earlier script)
    # The user says "I can see some gradient of purple and violet shade lets remove them"
    # We'll use regex to target tailwind classes
    content = re.sub(r'from-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'from-dark-walnut', content)
    content = re.sub(r'via-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'via-olive-bark', content)
    content = re.sub(r'to-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'to-dark-950', content)
    
    content = re.sub(r'bg-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'bg-dark-900', content)
    content = re.sub(r'border-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'border-olive-bark', content)
    content = re.sub(r'text-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'text-tangerine-dream', content)
    
    # Any hover classes
    content = re.sub(r'hover:text-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'hover:text-sunflower-gold', content)
    content = re.sub(r'hover:border-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'hover:border-sunflower-gold', content)
    content = re.sub(r'hover:bg-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'hover:bg-dark-800', content)
    
    # Any decoration classes
    content = re.sub(r'decoration-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'decoration-tangerine-dream/30', content)
    content = re.sub(r'hover:decoration-(purple|blue|pink|violet)-[1-9]00(?:/\d+)?', 'hover:decoration-sunflower-gold', content)
    
    # Shadow glows
    content = re.sub(r'shadow-\[0_0_[0-9]+px_rgba\([^)]+\)\]', '', content)
    
    # Some specific replacements for the hero/login background sections
    content = content.replace("bg-gradient-to-br from-dark-walnut via-olive-bark to-dark-950", "bg-dark-950")
    
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Flattened UI in {path}")

# Run replacement over all tsx files in app and components
base_dir = 'jobify'
for root, _, files in os.walk(base_dir):
    # skip node_modules to avoid breaking lucide-react etc.
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            replace_in_file(path)
