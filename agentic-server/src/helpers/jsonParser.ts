export const robustJSONParse = (text: string): any => {
    // Strategy 1: Standard JSON parsing 
    try {
        return JSON.parse(text.trim())
    } catch (error1) {
        console.log("📋 JSON simple parsing failed");
    }

    // Strategy 2: Extract JSON from mixed content 
    try {
        // Looking for JSON object patterns
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e2) {
        console.log("📋 Strategy 2 (extraction) failed, trying cleanup...");
    }


    // Strategy 3: Cleaning up common malformations
    try {
        let cleaned = text.trim();

        // Remove markdown code blocks
        cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Remove leading/trailing non-JSON text
        const startIdx = cleaned.indexOf('{');
        const endIdx = cleaned.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            cleaned = cleaned.substring(startIdx, endIdx + 1);
        }

        // Fix common JSON issues
        cleaned = cleaned
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
            .replace(/'/g, '"');     // Replace single quotes with double quotes

        return JSON.parse(cleaned);
    } catch (e3) {
        console.log("📋 Strategy 3 (cleanup) failed, trying lenient...");
    }

    // Strategy 4: Lastly- throw error
    throw new Error("All JSON parsing strategies failed");
}
