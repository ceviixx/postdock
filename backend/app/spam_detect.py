from typing import List
import re

DEFAULT_SPAM_PATTERNS = [
    r"\bviagra\b",
    r"\bfree money\b",
    r"\bclick here\b",
    r"\bwinner\b",
    r"\bmillions?\b",
    r"\bprince\b",
    r"\blottery\b",
    r"\bcasino\b",
    r"\bbitcoin\b",
    r"\bsex\b",
    r"\burgent offer\b",
    r"\baccount suspended\b",
]

def is_spam_mail(subject: str, body: str, patterns: List[str] = None, min_score: int = 2) -> bool:
    patterns = patterns or DEFAULT_SPAM_PATTERNS
    text = f"{subject}\n{body}".lower()
    score = 0
    for pat in patterns:
        if re.search(pat, text):
            score += 1
    return score >= min_score
