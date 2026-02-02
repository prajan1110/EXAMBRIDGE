/**
 * AI-powered certificate verification service
 * Analyzes medical certificates and recommends accessibility features
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
require('dotenv').config();

// API configuration (OpenAI only)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Groq support removed as per requirements; only OpenAI is used

/**
 * Analyze certificate using available AI APIs
 * @param {string} certificateText - Text extracted from certificate
 * @returns {Promise<Object>} Analysis results with recommended features
 */
async function analyzeCertificate(certificateText) {
  try {
    // Prepare prompt for AI APIs
    const prompt = `
      Analyze the following text extracted from a student's medical certificate. 
      Identify the type of disability, severity, and recommend appropriate accessibility features 
      for an online exam platform that makes the experience inclusive and equal.
      
      Certificate text: ${certificateText}
      
      Return your response in JSON format with these fields:
      - disability_type: The specific disability identified
      - recommended_features: Array of recommended accessibility features from this list only: 
        ["tts", "stt", "dyslexicFont", "highContrast", "fontSize", "extraTime", "captions", "keyboardOnly"]
      - confidence_score: Number between 0-1 indicating confidence in your assessment
    `;

    // Use OpenAI when key is present
    if (OPENAI_API_KEY) {
      try {
        console.log("Using OpenAI API for certificate analysis");
        const response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 800
          })
        });
        
        const data = await response.json();
        console.log("OpenAI API Response:", JSON.stringify(data, null, 2));
        
        // Check if the API returned an error
        if (data.error) {
          console.error("OpenAI API error:", data.error);
          throw new Error(`OpenAI API error: ${data.error.message || 'Unknown error'}`);
        }
        
        // Check if we have valid response data
        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
          throw new Error('Invalid OpenAI API response format');
        }
        
        // Parse the JSON response from the content
        try {
          // Extract JSON from markdown code blocks if present
          const content = data.choices[0].message.content;
          let jsonText = content;
          
          // Check if content is wrapped in markdown code blocks
          const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
          const match = content.match(jsonRegex);
          
          if (match && match[1]) {
            jsonText = match[1];
          }
          
          // Remove comments if any
          jsonText = jsonText.replace(/\/\/.*$/gm, '');
          
          console.log("Extracted JSON text from OpenAI response:", jsonText);
          
          const result = JSON.parse(jsonText);
          return result;
        } catch (parseError) {
          console.error("Error parsing OpenAI API response content:", parseError);
          throw new Error('Could not parse OpenAI API response content as JSON');
        }
      } catch (openaiError) {
        console.error("OpenAI API call failed:", openaiError);
        console.log("Falling back to rule-based analysis");
        return simulateAIVerification(certificateText);
      }
    }
    // No API keys available, use rule-based analysis
    else {
      console.log("No API keys available, using rule-based analysis");
      return simulateAIVerification(certificateText);
    }
  } catch (error) {
    console.error('Error analyzing certificate:', error);
    throw new Error('Failed to analyze certificate');
  }
}

/**
 * Simulate AI verification using rule-based analysis
 * @param {string} certificateText 
 * @returns {Object} Simulated AI analysis results
 */
function simulateAIVerification(certificateText) {
  const text = certificateText.toLowerCase();
  
  // Match disability type based on keywords
  if (text.includes('dyslexia')) {
    return {
      disability_type: "Dyslexia",
      recommended_features: ["tts", "dyslexicFont", "fontSize", "extraTime"],
      confidence_score: 0.92
    };
  } else if (text.includes('vision') || text.includes('blind') || text.includes('sight')) {
    return {
      disability_type: "Low Vision",
      recommended_features: ["tts", "highContrast", "fontSize", "extraTime"],
      confidence_score: 0.88
    };
  } else if (text.includes('hearing') || text.includes('deaf')) {
    return {
      disability_type: "Hearing Impairment",
      recommended_features: ["captions", "extraTime"],
      confidence_score: 0.90
    };
  } else if (text.includes('motor') || text.includes('physical') || text.includes('mobility')) {
    return {
      disability_type: "Motor Disability",
      recommended_features: ["keyboardOnly", "extraTime", "stt"],
      confidence_score: 0.85
    };
  } else if (text.includes('adhd') || text.includes('attention')) {
    return {
      disability_type: "ADHD",
      recommended_features: ["extraTime", "fontSize"],
      confidence_score: 0.87
    };
  } else {
    // If no clear disability is detected
    return {
      disability_type: "Unspecified",
      recommended_features: [],
      confidence_score: 0.45
    };
  }
}

module.exports = {
  analyzeCertificate
};
