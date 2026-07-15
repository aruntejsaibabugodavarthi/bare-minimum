"""Script to fix broken links in HTML files."""
import os
import glob

PUBLIC_DIR = '/Users/aruntej/Desktop/bare-minimum/apps/old-web/public'
html_files = glob.glob(os.path.join(PUBLIC_DIR, '*.html'))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace '#' with 'about.html'
    new_content = content.replace('href="#"', 'href="about.html"')

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed links in {os.path.basename(file_path)}")

print("Done fixing links.")
