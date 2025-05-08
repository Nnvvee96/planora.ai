// src/services/llmService.js
import axios from "axios";

class LLMService {
  constructor() {
    this.apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
    this.apiUrl = process.env.REACT_APP_HUGGINGFACE_API_URL;
    
    if (!this.apiKey || !this.apiUrl) {
      throw new Error("Hugging Face API key or URL not found in environment variables.");
    }
  }

  async generateResponse(prompt) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const generatedText = response.data[0].generated_text;
      return generatedText;
    } catch (error) {
      console.error("Error fetching response from Hugging Face API:", error);
      throw error; // Lassen wir den Fehler durchreichen, um spezifische Fehlerbehandlung in PlanTripPage zu ermöglichen
    }
  }

  async extractParameters(prompt) {
    const extractionPrompt = `Extrahiere Reise-Parameter aus diesem Text: "${prompt}". Gib zurück: {budget: [Wert], travelMonth: [Wert], duration: [Wert], destination: [Wert], accommodationType: [Wert], requiresPrivateBathroom: [true/false/null]}. Wenn ein Parameter nicht erkennbar ist, setze ihn auf null.`;
    try {
      const response = await this.generateResponse(extractionPrompt);
      // Parse the JSON response (assuming Mistral returns a valid JSON string)
      const params = JSON.parse(response.match(/{.*}/s)[0]);
      return params;
    } catch (error) {
      console.error("Error extracting parameters:", error);
      return {
        budget: null,
        travelMonth: null,
        duration: null,
        destination: null,
        accommodationType: null,
        requiresPrivateBathroom: null,
      };
    }
  }
}

export default new LLMService();