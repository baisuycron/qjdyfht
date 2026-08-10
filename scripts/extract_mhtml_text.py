from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
from pathlib import Path
import sys


class TextExtractor(HTMLParser):
    block_tags = {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "br"}

    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() in self.block_tags:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag.lower() in self.block_tags:
            self.parts.append("\n")

    def handle_data(self, data):
        self.parts.append(data)

    def text(self):
        lines = [" ".join(line.split()) for line in "".join(self.parts).splitlines()]
        return "\n".join(line for line in lines if line)


def main(source: str, target: str):
    msg = BytesParser(policy=policy.default).parse(Path(source).open("rb"))
    html_parts = []
    for part in msg.walk():
        if part.get_content_type() == "text/html":
            payload = part.get_payload(decode=True)
            if payload:
                html_parts.append(payload.decode("utf-8", errors="replace"))
    if not html_parts:
        raise RuntimeError("MHTML 中未找到 text/html 内容")
    extractor = TextExtractor()
    extractor.feed(max(html_parts, key=len))
    Path(target).write_text(extractor.text(), encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
