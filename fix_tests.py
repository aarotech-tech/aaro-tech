import re

with open("tests/sales.test.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'sig,\s*expires,\s*', '', content)
content = content.replace('sig:\s*.*?,', '')
content = content.replace('expires:\s*.*?,', '')

with open("tests/sales.test.ts", "w", encoding="utf-8") as f:
    f.write(content)
