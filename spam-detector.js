// Spam Detection System - Machine Learning Simulation
class SpamDetector {
    constructor() {
        // Simulated trained model parameters
        this.spamKeywords = {
            'free': 0.8, 'money': 0.7, 'winner': 0.9, 'congratulations': 0.85,
            'urgent': 0.75, 'limited': 0.7, 'offer': 0.65, 'click': 0.6,
            'now': 0.55, 'act': 0.65, 'immediately': 0.7, 'guaranteed': 0.8,
            'prize': 0.85, 'lottery': 0.9, 'million': 0.95, 'dollar': 0.75,
            'cash': 0.8, 'bonus': 0.7, 'discount': 0.6, 'sale': 0.55,
            'deal': 0.5, 'opportunity': 0.45, 'risk': 0.6, 'expire': 0.7,
            'hurry': 0.75, 'rush': 0.8, 'exclusive': 0.65, 'special': 0.6
        };
        
        this.safeKeywords = {
            'hello': 0.2, 'hi': 0.25, 'how': 0.15, 'are': 0.1, 'you': 0.1,
            'thank': 0.2, 'thanks': 0.25, 'please': 0.15, 'meeting': 0.3,
            'schedule': 0.35, 'appointment': 0.4, 'confirmation': 0.3,
            'order': 0.35, 'delivery': 0.4, 'update': 0.3, 'reminder': 0.25,
            'notification': 0.3, 'information': 0.25, 'details': 0.2,
            'contact': 0.3, 'support': 0.35, 'help': 0.25, 'assistance': 0.3
        };
        
        this.modelThreshold = 0.6;
    }

    // Text preprocessing - similar to what would be done in real ML
    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
            .split(/\s+/)
            .filter(word => word.length > 2); // Remove short words
    }

    // Feature extraction - simplified version of text vectorization
    extractFeatures(words) {
        const features = {
            spamScore: 0,
            safeScore: 0,
            wordCount: words.length,
            hasExclamation: false,
            hasAllCaps: false,
            hasNumbers: false
        };

        words.forEach(word => {
            // Check spam keywords
            if (this.spamKeywords[word]) {
                features.spamScore += this.spamKeywords[word];
            }
            
            // Check safe keywords
            if (this.safeKeywords[word]) {
                features.safeScore += this.safeKeywords[word];
            }
            
            // Check for spam indicators
            if (word.length > 8) features.hasAllCaps = true;
            if (/\d/.test(word)) features.hasNumbers = true;
        });

        // Check original text for exclamation marks and caps
        const originalText = words.join(' ');
        features.hasExclamation = originalText.includes('!');
        features.hasAllCaps = features.hasAllCaps || /[A-Z]{3,}/.test(originalText);

        return features;
    }

    // Classification algorithm - simplified logistic regression
    predict(text) {
        const words = this.preprocessText(text);
        const features = this.extractFeatures(words);
        
        // Calculate spam probability
        let spamProbability = 0.5; // Base probability
        
        // Adjust based on keywords
        const totalWords = features.wordCount || 1;
        const spamDensity = features.spamScore / totalWords;
        const safeDensity = features.safeScore / totalWords;
        
        spamProbability += spamDensity * 0.4;
        spamProbability -= safeDensity * 0.3;
        
        // Adjust based on spam indicators
        if (features.hasExclamation) spamProbability += 0.15;
        if (features.hasAllCaps) spamProbability += 0.2;
        if (features.hasNumbers) spamProbability += 0.1;
        
        // Adjust based on text characteristics
        if (text.length < 20) spamProbability += 0.1;
        if (text.includes('$$') || text.includes('$$$')) spamProbability += 0.3;
        if (text.includes('!!!')) spamProbability += 0.25;
        
        // Normalize probability
        spamProbability = Math.max(0, Math.min(1, spamProbability));
        
        return {
            isSpam: spamProbability > this.modelThreshold,
            confidence: Math.abs(spamProbability - 0.5) * 2, // Confidence from 0-1
            spamProbability: spamProbability,
            features: features
        };
    }

    // Get explanation for prediction
    getExplanation(prediction, text) {
        const explanations = [];
        
        if (prediction.spamProbability > 0.7) {
            explanations.push('Contains high-risk spam keywords');
        }
        if (text.includes('!') && text.includes('$$')) {
            explanations.push('Contains money symbols with exclamation marks');
        }
        if (text.toUpperCase() === text && text.length > 5) {
            explanations.push('Text is mostly in uppercase');
        }
        if (prediction.features.spamScore > prediction.features.safeScore * 2) {
            explanations.push('High spam keyword density detected');
        }
        
        if (explanations.length === 0) {
            explanations.push('Based on text pattern analysis');
        }
        
        return explanations;
    }
}

// Global instance
const spamDetector = new SpamDetector();

// Main analysis function
function analyzeMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        alert('Please enter a message to analyze!');
        return;
    }
    
    // Get prediction
    const prediction = spamDetector.predict(message);
    const explanations = spamDetector.getExplanation(prediction, message);
    
    // Display results
    displayResults(prediction, explanations);
    
    // Log for testing
    console.log('Analysis Results:', {
        message: message,
        prediction: prediction,
        explanations: explanations
    });
}

// Display results in the UI
function displayResults(prediction, explanations) {
    const resultsDiv = document.getElementById('results');
    const predictionCard = document.getElementById('predictionResult');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceText = document.getElementById('confidenceText');
    
    // Show results
    resultsDiv.style.display = 'block';
    
    // Update prediction card
    if (prediction.isSpam) {
        predictionCard.className = 'prediction-card spam';
        predictionCard.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> SPAM DETECTED
            <div class="mt-2">
                <small style="color: rgba(255,255,255,0.9);">${explanations.join(', ')}</small>
            </div>
        `;
    } else {
        predictionCard.className = 'prediction-card not-spam';
        predictionCard.innerHTML = `
            <i class="fas fa-check-circle"></i> NOT SPAM
            <div class="mt-2">
                <small style="color: rgba(255,255,255,0.9);">Message appears to be legitimate</small>
            </div>
        `;
    }
    
    // Update confidence bar
    const confidencePercent = Math.round(prediction.confidence * 100);
    confidenceBar.style.width = confidencePercent + '%';
    confidenceBar.className = 'confidence-fill ' + (prediction.isSpam ? 'bg-secondary' : 'bg-success');
    
    // Update confidence text
    confidenceText.textContent = `Confidence: ${confidencePercent}%`;
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Test message function
function testMessage(message) {
    document.getElementById('messageInput').value = message;
    analyzeMessage();
}

// Clear input function
function clearInput() {
    document.getElementById('messageInput').value = '';
    document.getElementById('results').style.display = 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Spam Detection System loaded successfully!');
    console.log('To test if it\'s working:');
    console.log('1. Try clicking the test messages above');
    console.log('2. Type your own messages and click "Analyze Message"');
    console.log('3. Check the browser console for detailed analysis logs');
    console.log('4. Verify that predictions change based on message content');
});

// Allow Enter key to analyze
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        analyzeMessage();
    }
});