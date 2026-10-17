
import re
from transformers import MarianMTModel, MarianTokenizer

MODEL_NAME = "Helsinki-NLP/opus-mt-en-ar"

tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
model = MarianMTModel.from_pretrained(MODEL_NAME)


def translate_to_arabic(text):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True
    )

    translated = model.generate(
        **inputs,
        max_new_tokens=100
    )

    arabic_text = tokenizer.decode(
        translated[0],
        skip_special_tokens=True
    )

    # Remove consecutive repeated words
    arabic_text = re.sub(
        r'\b(\w+)(\s+\1\b)+',
        r'\1',
        arabic_text
    )

    return arabic_text.strip()
