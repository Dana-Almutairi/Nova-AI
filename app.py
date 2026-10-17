
from flask import Flask, render_template, request, jsonify
from ai_model import analyze_image
from translator import translate_to_arabic
from PIL import UnidentifiedImageError
import io

app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    if "image" not in request.files:
        return jsonify({"error": "لم يتم رفع صورة"}), 400

    image = request.files["image"]

    if image.filename == "":
        return jsonify({"error": "الرجاء اختيار صورة"}), 400

    try:
        image_bytes = image.read()

        # Step 1: Analyze image using AI
        english_description = analyze_image(
            io.BytesIO(image_bytes)
        )

        # Step 2: Translate into Arabic locally
        arabic_description = translate_to_arabic(
            english_description
        )

        # Step 3: Return Arabic description
        return jsonify({
            "description": arabic_description,
            "english_description": english_description,
            "language": "ar"
        })

    except (UnidentifiedImageError, OSError):
        return jsonify({
            "error": "ملف الصورة غير صالح"
        }), 400

    except Exception:
        app.logger.exception("Image analysis failed")

        return jsonify({
            "error": "حدث خطأ أثناء تحليل الصورة"
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
