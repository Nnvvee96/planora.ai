// src/services/llmService.js
import axios from "axios";

class LLMService {
  constructor() {
    this.apiKey = process.env.VITE_LLM_API_KEY;
    this.apiUrl = process.env.VITE_API_BASE_URL;

    if (!this.apiKey || !this.apiUrl) {
      throw new Error("Hugging Face API key or URL not found in environment variables.");
    }
  }

  handleApiError(error, method) {
    console.error(`Error in ${method}:`, error);
    throw error; // Fehler durchreichen für spezifische Behandlung in PlanTripPage
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
      return response.data[0].generated_text;
    } catch (error) {
      this.handleApiError(error, "generateResponse");
    }
  }

  async extractParameters(prompt) {
    const extractionPrompt = `Extrahiere Reise-Parameter aus diesem Text: "${prompt}". Gib zurück: {budget: [Wert], travelMonth: [Wert], duration: [Wert], destination: [Wert], accommodationType: [Wert], requiresPrivateBathroom: [true/false/null]}. Wenn ein Parameter nicht erkennbar ist, setze ihn auf null.`;
    try {
      const response = await this.generateResponse(extractionPrompt);
      const params = JSON.parse(response.match(/{.*}/s)[0]);
      return params;
    } catch (error) {
      this.handleApiError(error, "extractParameters");
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