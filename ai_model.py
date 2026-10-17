
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

MODEL_NAME = "Salesforce/blip-image-captioning-base"

processor = BlipProcessor.from_pretrained(MODEL_NAME)
model = BlipForConditionalGeneration.from_pretrained(MODEL_NAME)


def analyze_image(image_file):
    image = Image.open(image_file).convert("RGB")

    inputs = processor(
        image,
        return_tensors="pt"
    )

    output = model.generate(
        **inputs,
        max_new_tokens=100,
        num_beams=5,
        repetition_penalty=1.2
    )

    description = processor.decode(
        output[0],
        skip_special_tokens=True
    )

    return description
