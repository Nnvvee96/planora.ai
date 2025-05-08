// src/utils/chatLogic.js
import llmService from "../services/llmService";
import { generateChatName } from "./chatUtils";

export const handleSendMessage = async (
  userInput,
  messages,
  setMessages,
  chatName,
  setChatName,
  tripDetails,
  setTripDetails,
  step,
  setStep,
  user
) => {
  if (!userInput.trim()) return;

  const newMessages = [...messages, { sender: "user", text: userInput }];
  setMessages(newMessages);

  if (newMessages.length === 1) {
    setChatName(generateChatName(userInput));
  }

  // Check for off-topic input
  const lowerInput = userInput.toLowerCase();
  if (
    !lowerInput.includes("trip") &&
    !lowerInput.includes("travel") &&
    !lowerInput.includes("vacation") &&
    !lowerInput.includes("destination") &&
    !lowerInput.includes("budget") &&
    !lowerInput.includes("month") &&
    !lowerInput.includes("duration") &&
    !lowerInput.includes("recommend") &&
    !lowerInput.includes("hotel") &&
    !lowerInput.includes("airbnb") &&
    !lowerInput.includes("hostel") &&
    !lowerInput.includes("bathroom") &&
    !lowerInput.includes("explore") &&
    !lowerInput.includes("adjust") &&
    !lowerInput.includes("yes") &&
    !lowerInput.includes("no")
  ) {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "I’m sorry, I can only help with travel planning. Let’s plan a trip—where would you like to go, or do you need a recommendation?",
      },
    ]);
    return;
  }

  // Extract parameters using LLMService
  const extractedParams = await llmService.extractParameters(userInput);

  // Update tripDetails with extracted parameters
  const updatedTripDetails = {
    budget: extractedParams.budget || tripDetails.budget,
    travelMonth: extractedParams.travelMonth || tripDetails.travelMonth,
    duration: extractedParams.duration || tripDetails.duration,
    destination: extractedParams.destination || tripDetails.destination,
    travelStyle: tripDetails.travelStyle,
    accommodationType: extractedParams.accommodationType || tripDetails.accommodationType,
    requiresPrivateBathroom:
      extractedParams.requiresPrivateBathroom !== null
        ? extractedParams.requiresPrivateBathroom
        : tripDetails.requiresPrivateBathroom,
  };
  setTripDetails(updatedTripDetails);

  // Determine missing information and ask for it
  if (!updatedTripDetails.budget && step !== "budget") {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Let’s start planning! What’s your budget (in $)? (e.g., 1000 or 1000-1500)" },
    ]);
    setStep("budget");
  } else if (!updatedTripDetails.travelMonth && step !== "travelMonth") {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Great! Which month(s) would you like to travel? (e.g., January or January-March)" },
    ]);
    setStep("travelMonth");
  } else if (!updatedTripDetails.duration && step !== "duration") {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "How many days or weeks will you be staying? (e.g., 4-7 days, 1-2 weeks)" },
    ]);
    setStep("duration");
  } else if (!updatedTripDetails.destination && step !== "destination") {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Do you have a destination in mind (e.g., Barcelona, France, Europe), or should I recommend some? (Type 'recommend')",
      },
    ]);
    setStep("destination");
  } else if (!updatedTripDetails.accommodationType && step !== "accommodationType") {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "What type of accommodation do you prefer? (e.g., Hotel, Airbnb, Hostel)" },
    ]);
    setStep("accommodationType");
  } else if (updatedTripDetails.requiresPrivateBathroom === null && step !== "privateBathroom") {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Do you require a private bathroom? (Yes/No)" },
    ]);
    setStep("privateBathroom");
  } else {
    // All parameters are filled, proceed to recommendations
    if (step !== "recommendations" && step !== "details" && step !== "adjust") {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thanks for the details! Let me put together some recommendations for you..." },
      ]);
      setStep("recommendations");

      setTimeout(async () => {
        try {
          const prompt = `Suggest a detailed travel plan for a trip to ${updatedTripDetails.destination} with a budget of $${updatedTripDetails.budget}, traveling in ${updatedTripDetails.travelMonth}, for ${updatedTripDetails.duration}, preferring a ${updatedTripDetails.travelStyle || "relaxed"} vacation. The user prefers ${updatedTripDetails.accommodationType} accommodation${updatedTripDetails.requiresPrivateBathroom ? " with a private bathroom" : ""}. Provide a detailed itinerary with activities, accommodation suggestions, and approximate costs.`;
          const recommendation = await llmService.generateResponse(prompt);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `${recommendation}\n\nWould you like to explore this option, adjust any details, or see another destination?`,
            },
          ]);
        } catch (error) {
          let errorMessage = "I ran into an issue while fetching recommendations.";
          if (error.response?.status === 429) {
            errorMessage = "I’ve hit a rate limit with the API. Please wait a moment and try again.";
          }
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `${errorMessage} For now, I suggest a relaxed trip to ${updatedTripDetails.destination}. Would you like to proceed or try again?`,
            },
          ]);
        }
      }, 1000);
    } else if (step === "recommendations") {
      const input = userInput.trim().toLowerCase();
      if (input.includes("explore") || input.includes("yes") || input.includes("proceed")) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Great! Let’s dive deeper into this destination. What would you like to know more about? (e.g., activities, accommodations, flights)",
          },
        ]);
        setStep("details");
      } else if (input.includes("adjust")) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "What would you like to adjust? (e.g., budget, travel month, duration, destination, accommodation)",
          },
        ]);
        setStep("adjust");
      } else if (input.includes("another") || input.includes("no")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Okay, let me find another destination for you. One moment..." },
        ]);
        setStep("destination");
        setTimeout(async () => {
          try {
            const prompt = `Suggest a travel destination for a budget of $${updatedTripDetails.budget}, traveling in ${updatedTripDetails.travelMonth}, for ${updatedTripDetails.duration}, preferring a ${updatedTripDetails.travelStyle || "relaxed"} vacation. Recommend a specific city or region that fits the budget and travel style. Provide a brief suggestion in 2-3 sentences.`;
            const recommendation = await llmService.generateResponse(prompt);
            setTripDetails({
              ...updatedTripDetails,
              destination: recommendation.split("\n")[0].replace("Destination: ", ""),
            });
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `${recommendation}\n\nWhat type of accommodation do you prefer? (e.g., Hotel, Airbnb, Hostel)`,
              },
            ]);
            setStep("accommodationType");
          } catch (error) {
            let errorMessage = "I ran into an issue while fetching a recommendation.";
            if (error.response?.status === 429) {
              errorMessage = "I’ve hit a rate limit with the API. Please wait a moment and try again.";
            }
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `${errorMessage} For now, I suggest Barcelona, Spain. Let me know if you'd like to proceed.`,
              },
            ]);
            setStep("accommodationType");
          }
        }, 1000);
      } else if (input.includes("try again")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Let me try fetching a recommendation again. One moment..." },
        ]);
        setTimeout(async () => {
          try {
            const prompt = `Suggest a detailed travel plan for a trip to ${updatedTripDetails.destination} with a budget of $${updatedTripDetails.budget}, traveling in ${updatedTripDetails.travelMonth}, for ${updatedTripDetails.duration}, preferring a ${updatedTripDetails.travelStyle || "relaxed"} vacation. The user prefers ${updatedTripDetails.accommodationType} accommodation${updatedTripDetails.requiresPrivateBathroom ? " with a private bathroom" : ""}. Provide a detailed itinerary with activities, accommodation suggestions, and approximate costs.`;
            const recommendation = await llmService.generateResponse(prompt);
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `${recommendation}\n\nWould you like to explore this option, adjust any details, or see another destination?`,
              },
            ]);
          } catch (error) {
            let errorMessage = "I ran into an issue while fetching recommendations.";
            if (error.response?.status === 429) {
              errorMessage = "I’ve hit a rate limit with the API. Please wait a moment and try again.";
            }
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `${errorMessage} For now, I suggest a relaxed trip to ${updatedTripDetails.destination}. Would you like to proceed or try again?`,
              },
            ]);
          }
        }, 1000);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I’m not sure what you mean. Would you like to explore this destination, adjust any details, see another destination, or try again?",
          },
        ]);
      }
    } else if (step === "details") {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Here’s more information based on your request. One moment..." },
      ]);
      setTimeout(async () => {
        try {
          const prompt = `Provide detailed information about ${userInput} for a trip to ${updatedTripDetails.destination} with a budget of $${updatedTripDetails.budget}, traveling in ${updatedTripDetails.travelMonth}, for ${updatedTripDetails.duration}, preferring a ${updatedTripDetails.travelStyle || "relaxed"} vacation. The user prefers ${updatedTripDetails.accommodationType} accommodation${updatedTripDetails.requiresPrivateBathroom ? " with a private bathroom" : ""}.`;
          const details = await llmService.generateResponse(prompt);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `${details}\n\nWould you like to know more about something else, adjust any details, or see another destination?`,
            },
          ]);
        } catch (error) {
          let errorMessage = "I ran into an issue while fetching details.";
          if (error.response?.status === 429) {
            errorMessage = "I’ve hit a rate limit with the API. Please wait a moment and try again.";
          }
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `${errorMessage} For now, I suggest checking online resources for ${userInput} in ${updatedTripDetails.destination}. Would you like to try again?`,
            },
          ]);
        }
      }, 1000);
    } else if (step === "adjust") {
      const input = userInput.trim().toLowerCase();
      if (input.includes("budget")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please enter your new budget (e.g., 1000 or 1000-1500)." },
        ]);
        setStep("budget");
      } else if (input.includes("travel month")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please enter your new travel month(s) (e.g., January or January-March)." },
        ]);
        setStep("travelMonth");
      } else if (input.includes("duration")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please enter your new duration (e.g., 4-7 days, 1-2 weeks)." },
        ]);
        setStep("duration");
      } else if (input.includes("destination")) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Please enter your new destination (e.g., Barcelona, France, Europe), or type 'recommend' for suggestions.",
          },
        ]);
        setStep("destination");
      } else if (input.includes("accommodation")) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "What type of accommodation do you prefer now? (e.g., Hotel, Airbnb, Hostel)" },
        ]);
        setStep("accommodationType");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I’m not sure what you’d like to adjust. You can adjust budget, travel month, duration, destination, or accommodation. What would you like to change?",
          },
        ]);
      }
    }
  }
};