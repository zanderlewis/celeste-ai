# Markup.py

import re

def markup(text):
    # Handle nested bold and italic
    text = re.sub(r'\*\*(.*?)\*(.*?)\*\*(.*?)\*', r'<b>\1<i>\2</i>\3</b>', text)
    # Both (bold and italic)
    text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<b><i>\1</i></b>', text)
    # Bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Italic
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    return text

# Test the function
print(markup("**Hello *There***"))
print(markup("**HELLO TO *EVERYONE!***"))
print(markup("**HELLO TO *EVERYONE!* **"))