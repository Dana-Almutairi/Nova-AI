
const imageInput = document.getElementById("imageInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const speakBtn = document.getElementById("speakBtn");
const result = document.getElementById("result");

const stopBtn = document.getElementById("stopBtn");

const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");

let previewUrl = null;

let currentDescription = "";

// Speak Arabic text
function speakText(text) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "ar-SA";
    speech.rate = 0.9;

    speechSynthesis.speak(speech);
}

// Analyze image
analyzeBtn.addEventListener("click", async function () {

    if (!imageInput.files.length) {
        result.textContent = "الرجاء اختيار صورة أولاً";
        speakText(result.textContent);
        imageInput.focus();
        return;
    }

    const formData = new FormData();
    formData.append("image", imageInput.files[0]);

    speechSynthesis.cancel();
    currentDescription = "";

    result.textContent = "جاري تحليل الصورة...";
    analyzeBtn.disabled = true;
    speakBtn.disabled = true;

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "فشل التحليل");
        }

        currentDescription = data.description;
        result.textContent = currentDescription;

        speakBtn.disabled = false;

        // Automatically read the description
        speakText(currentDescription);

    } catch (error) {
        result.textContent = error.message;
        speakText(result.textContent);

    } finally {
        analyzeBtn.disabled = false;
    }
});

// Replay description
speakBtn.addEventListener("click", function () {
    if (currentDescription) {
        speakText(currentDescription);
    }
});

// Stop old description when selecting a new image

imageInput.addEventListener("change", function () {
    speechSynthesis.cancel();

    currentDescription = "";
    speakBtn.disabled = true;

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }

    if (imageInput.files.length) {
        const file = imageInput.files[0];

        if (!file.type.startsWith("image/")) {
            previewContainer.hidden = true;
            imagePreview.removeAttribute("src");
            result.textContent = "الرجاء اختيار ملف صورة صالح";
            return;
        }

        previewUrl = URL.createObjectURL(file);
        imagePreview.src = previewUrl;
        previewContainer.hidden = false;

        result.textContent = "اضغط على تحليل الصورة للحصول على الوصف";
    } else {
        previewContainer.hidden = true;
        imagePreview.removeAttribute("src");
        result.textContent = "اختر صورة للبدء";
    }
});


// Disable speech button until analysis is complete
speakBtn.disabled = true;


stopBtn.addEventListener("click", function () {
    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
    }
});
