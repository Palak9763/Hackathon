FEVER_SUGGESTIONS = {
    "en": {
        "otc_meds": "Paracetamol (500mg) for fever/pain. ORS for rehydration.",
        "home_remedies": "Rest and Hydration: Drink clear fluids often. Use a cool, damp cloth (tepid sponging).",
        "warnings": ["Seek doctor if fever > 102F (38.9C), persists > 3 days, or breathing difficulty is severe."],
        "disclaimer": "NOT a medical device. Consult a licensed doctor for any medical emergency."
    }
}

def get_fever_suggestions(symptoms: list, lang: str = 'en'):
    return FEVER_SUGGESTIONS.get(lang.lower(), FEVER_SUGGESTIONS["en"])
