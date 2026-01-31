// Enhanced Spam Detection System - Machine Learning Simulation
class SpamDetectorEnhanced {
    constructor() {
        // Enhanced spam keywords with better weight distribution
        this.spamKeywords = {
            // High-confidence spam indicators
            'free': 0.85, 'winner': 0.9, 'congratulations': 0.88, 'lottery': 0.92,
            'million': 0.95, 'thousand': 0.8, 'dollar': 0.75, 'cash': 0.82,
            'prize': 0.87, 'jackpot': 0.93, 'bonus': 0.78, 'gift': 0.7,
            
            // Urgency indicators
            'urgent': 0.8, 'immediately': 0.75, 'hurry': 0.77, 'rush': 0.79,
            'limited': 0.73, 'expire': 0.76, 'deadline': 0.72, 'act': 0.7,
            'now': 0.65, 'today': 0.6, 'quick': 0.62, 'fast': 0.6,
            
            // Action words
            'click': 0.68, 'call': 0.55, 'phone': 0.58, 'contact': 0.52,
            'reply': 0.6, 'respond': 0.58, 'send': 0.55, 'money': 0.75,
            'pay': 0.7, 'buy': 0.65, 'purchase': 0.6, 'order': 0.45,
            
            // Scam indicators
            'guarantee': 0.83, 'risk': 0.68, 'secure': 0.5, 'verify': 0.62,
            'account': 0.4, 'suspended': 0.75, 'blocked': 0.73, 'verify': 0.65,
            'password': 0.7, 'login': 0.55, 'details': 0.45, 'information': 0.42
        };
        
        // Enhanced safe keywords with better coverage
        this.safeKeywords = {
            // Personal communication
            'hello': 0.15, 'hi': 0.18, 'hey': 0.2, 'good': 0.12,
            'morning': 0.25, 'afternoon': 0.25, 'evening': 0.25, 'thanks': 0.22,
            'thank': 0.2, 'please': 0.15, 'sorry': 0.18, 'apologize': 0.2,
            
            // Business communication
            'meeting': 0.35, 'schedule': 0.38, 'appointment': 0.42, 'conference': 0.4,
            'call': 0.3, 'discussion': 0.35, 'presentation': 0.45, 'report': 0.4,
            'project': 0.35, 'update': 0.32, 'status': 0.3, 'progress': 0.33,
            
            // Professional terms
            'confirmation': 0.35, 'notification': 0.28, 'reminder': 0.25, 'alert': 0.3,
            'information': 0.25, 'details': 0.22, 'document': 0.35, 'file': 0.3,
            'report': 0.4, 'data': 0.28, 'analysis': 0.35, 'review': 0.32,
            
            // Support and help
            'support': 0.35, 'help': 0.25, 'assist': 0.3, 'aid': 0.28,
            'service': 0.3, 'team': 0.25, 'member': 0.22, 'colleague': 0.35
        };
        
        // Enhanced model parameters
        this.modelThreshold = 0.65; // Slightly higher threshold for better precision
        this.minTextLength = 3; // Minimum text length to process
        this.maxTextLength = 1000; // Maximum text length to prevent abuse
        
        // Common spam patterns
        this.spamPatterns = [
            /\b\d{1,3}(,\d{3})*\b/g, // Large numbers with commas
            /\$\d+/g, // Dollar amounts
            /\b\d+\s*(million|thousand|hundred)\b/gi, // Number words
            /[A-Z]{4,}/g, // Excessive capitalization
            /!{3,}/g, // Multiple exclamation marks
            /\b\d{4,}\b/g // Large standalone numbers
        ];
        
        // Trust indicators
        this.trustIndicators = [
            'dear', 'regards', 'sincerely', 'best', 'thanks', 'please',
            'could', 'would', 'might', 'may', 'can', 'should'
        ];
    }

    // Enhanced text preprocessing
    preprocessText(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }
        
        // Trim and validate length
        text = text.trim();
        if (text.length < this.minTextLength || text.length > this.maxTextLength) {
            return [];
        }
        
        // Convert to lowercase and clean
        let processed = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        // Split into words and filter
        return processed
            .split(' ')
            .filter(word => word.length > 2 && word.length < 20) // Reasonable word lengths
            .slice(0, 50); // Limit to first 50 words for performance
    }

    // Enhanced feature extraction
    extractFeatures(words, originalText) {
        const features = {
            spamScore: 0,
            safeScore: 0,
            wordCount: words.length,
            uniqueWords: new Set(words).size,
            hasExclamation: false,
            hasQuestion: false,
            hasAllCaps: false,
            hasNumbers: false,
            hasDollarSigns: false,
            hasEmail: false,
            hasPhone: false,
            hasURL: false,
            spamPatternMatches: 0,
            trustScore: 0,
            charCount: originalText.length,
            avgWordLength: 0,
            capsRatio: 0
        };

        // Calculate average word length
        if (words.length > 0) {
            features.avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        }

        // Analyze each word
        words.forEach(word => {
            // Check spam keywords
            if (this.spamKeywords[word]) {
                features.spamScore += this.spamKeywords[word];
            }
            
            // Check safe keywords
            if (this.safeKeywords[word]) {
                features.safeScore += this.safeKeywords[word];
            }
            
            // Check for trust indicators
            if (this.trustIndicators.includes(word)) {
                features.trustScore += 0.1;
            }
        });

        // Check original text for patterns
        const originalLower = originalText.toLowerCase();
        
        // Punctuation analysis
        features.hasExclamation = originalText.includes('!');
        features.hasQuestion = originalText.includes('?');
        
        // Capitalization analysis
        const capsMatches = originalText.match(/[A-Z]/g);
        features.capsRatio = capsMatches ? capsMatches.length / originalText.length : 0;
        features.hasAllCaps = features.capsRatio > 0.3 || /[A-Z]{4,}/.test(originalText);
        
        // Special characters and patterns
        features.hasNumbers = /\d/.test(originalText);
        features.hasDollarSigns = originalText.includes('$');
        features.hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(originalText);
        features.hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(originalText);
        features.hasURL = /\bhttps?:\/\/[^\s]+\b|www\.[^\s]+\b/.test(originalText);
        
        // Check spam patterns
        this.spamPatterns.forEach(pattern => {
            const matches = originalText.match(pattern);
            if (matches) {
                features.spamPatternMatches += matches.length;
            }
        });

        return features;
    }

    // Enhanced classification algorithm
    predict(text) {
        // Validate input
        if (!text || typeof text !== 'string') {
            return {
                isSpam: false,
                confidence: 0,
                spamProbability: 0.5,
                error: 'Invalid input',
                features: {}
            };
        }

        const words = this.preprocessText(text);
        if (words.length === 0) {
            return {
                isSpam: false,
                confidence: 0,
                spamProbability: 0.5,
                error: 'Text too short or invalid',
                features: {}
            };
        }

        const features = this.extractFeatures(words, text);
        
        // Calculate spam probability using multiple factors
        let spamProbability = 0.5; // Base probability
        
        // Keyword-based scoring
        const totalWords = features.wordCount || 1;
        const spamDensity = features.spamScore / totalWords;
        const safeDensity = features.safeScore / totalWords;
        
        spamProbability += spamDensity * 0.35;
        spamProbability -= safeDensity * 0.25;
        spamProbability += features.trustScore * 0.15;
        
        // Pattern-based scoring
        if (features.hasExclamation) spamProbability += 0.12;
        if (features.hasQuestion) spamProbability -= 0.08; // Questions are usually not spam
        if (features.hasAllCaps) spamProbability += 0.18;
        if (features.hasNumbers) spamProbability += 0.08;
        if (features.hasDollarSigns) spamProbability += 0.15;
        if (features.hasEmail) spamProbability += 0.1;
        if (features.hasPhone) spamProbability += 0.12;
        if (features.hasURL) spamProbability += 0.08;
        
        // Advanced pattern matching
        if (features.spamPatternMatches > 0) {
            spamProbability += Math.min(features.spamPatternMatches * 0.1, 0.3);
        }
        
        // Text characteristics
        if (text.length < 15) spamProbability += 0.1;
        if (text.length > 500) spamProbability += 0.05; // Longer messages slightly more suspicious
        if (features.avgWordLength > 8) spamProbability += 0.08; // Very long words
        if (features.capsRatio > 0.4) spamProbability += 0.2;
        
        // Special patterns
        if (text.includes('$$') || text.includes('$$$')) spamProbability += 0.25;
        if (text.includes('!!!')) spamProbability += 0.2;
        if (text.includes('100%')) spamProbability += 0.15;
        if (text.includes('free!')) spamProbability += 0.3;
        if (text.includes('click here')) spamProbability += 0.25;
        
        // Normalize probability
        spamProbability = Math.max(0, Math.min(1, spamProbability));
        
        // Calculate confidence based on distance from threshold
        const confidence = Math.abs(spamProbability - this.modelThreshold) * 3; // Amplify confidence
        const normalizedConfidence = Math.max(0, Math.min(1, confidence));
        
        return {
            isSpam: spamProbability > this.modelThreshold,
            confidence: normalizedConfidence,
            spamProbability: spamProbability,
            features: features,
            error: null
        };
    }

    // Enhanced explanation generation
    getExplanation(prediction, text) {
        const explanations = [];
        const features = prediction.features;
        
        // High-confidence indicators
        if (prediction.spamProbability > 0.8) {
            explanations.push('Contains multiple high-risk spam indicators');
        }
        
        // Keyword-based explanations
        if (features.spamScore > features.safeScore * 2) {
            explanations.push('High spam keyword density detected');
        }
        
        // Pattern-based explanations
        if (features.hasAllCaps) {
            explanations.push('Excessive use of capital letters');
        }
        if (features.hasExclamation && features.hasDollarSigns) {
            explanations.push('Contains money symbols with exclamation marks');
        }
        if (features.spamPatternMatches > 2) {
            explanations.push('Multiple spam patterns detected');
        }
        if (features.hasEmail && features.hasPhone) {
            explanations.push('Contains contact information');
        }
        if (text.includes('100%') || text.includes('guarantee')) {
            explanations.push('Contains guarantee statements');
        }
        if (text.includes('free') && text.includes('money')) {
            explanations.push('Contains financial incentive keywords');
        }
        
        // Trust indicators (for non-spam)
        if (!prediction.isSpam && features.trustScore > 0.2) {
            explanations.push('Contains trust indicators');
        }
        
        // Default explanation
        if (explanations.length === 0) {
            explanations.push('Based on comprehensive text pattern analysis');
        }
        
        return explanations.slice(0, 2); // Limit to top 2 explanations
    }
}

// Global instance
const spamDetector = new SpamDetectorEnhanced();

// Enhanced main analysis function
function analyzeMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    // Better input validation
    if (!message) {
        showNotification('Please enter a message to analyze!', 'warning');
        return;
    }
    
    if (message.length < 2) {
        showNotification('Message too short. Please enter at least 2 characters.', 'warning');
        return;
    }
    
    if (message.length > 1000) {
        showNotification('Message too long. Please limit to 1000 characters.', 'warning');
        return;
    }
    
    try {
        // Get prediction
        const prediction = spamDetector.predict(message);
        
        if (prediction.error) {
            showNotification('Analysis error: ' + prediction.error, 'danger');
            return;
        }
        
        const explanations = spamDetector.getExplanation(prediction, message);
        
        // Display results
        displayResults(prediction, explanations);
        
        // Enhanced logging
        console.log('🤖 Enhanced Spam Analysis Results:', {
            message: message,
            prediction: prediction,
            explanations: explanations,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('An error occurred during analysis. Please try again.', 'danger');
    }
}

// Enhanced result display with better UI
function displayResults(prediction, explanations) {
    const resultsDiv = document.getElementById('results');
    const predictionCard = document.getElementById('predictionResult');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceText = document.getElementById('confidenceText');
    
    // Show results with animation
    resultsDiv.style.display = 'block';
    resultsDiv.style.opacity = '0';
    setTimeout(() => {
        resultsDiv.style.transition = 'opacity 0.5s ease';
        resultsDiv.style.opacity = '1';
    }, 50);
    
    // Update prediction card with enhanced styling
    if (prediction.isSpam) {
        predictionCard.className = 'prediction-card spam';
        predictionCard.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> SPAM DETECTED
            <div class="mt-2">
                <small style="color: rgba(255,255,255,0.9); font-size: 0.9em;">${explanations.join(' • ')}</small>
            </div>
        `;
    } else {
        predictionCard.className = 'prediction-card not-spam';
        predictionCard.innerHTML = `
            <i class="fas fa-check-circle"></i> NOT SPAM
            <div class="mt-2">
                <small style="color: rgba(255,255,255,0.9); font-size: 0.9em;">${explanations.join(' • ')}</small>
            </div>
        `;
    }
    
    // Update confidence bar with enhanced styling
    const confidencePercent = Math.round(prediction.confidence * 100);
    confidenceBar.style.width = confidencePercent + '%';
    confidenceBar.className = 'confidence-fill bg-secondary';
    
    // Add confidence-specific styling
    if (confidencePercent > 80) {
        confidenceBar.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
    } else if (confidencePercent > 60) {
        confidenceBar.style.background = 'linear-gradient(45deg, #ffc107, #fd7e14)';
    } else {
        confidenceBar.style.background = 'linear-gradient(45deg, #6c757d, #5a6268)';
    }
    
    // Update confidence text with additional info
    confidenceText.textContent = `Confidence: ${confidencePercent}% (${prediction.spamProbability > 0.65 ? 'High spam probability' : prediction.spamProbability < 0.35 ? 'Low spam probability' : 'Uncertain'})`;
    
    // Smooth scroll to results
    resultsDiv.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
    });
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Test message function with validation
function testMessage(message) {
    if (!message || typeof message !== 'string') {
        showNotification('Invalid test message', 'warning');
        return;
    }
    
    document.getElementById('messageInput').value = message;
    analyzeMessage();
}

// Clear input function with confirmation
function clearInput() {
    const messageInput = document.getElementById('messageInput');
    const resultsDiv = document.getElementById('results');
    
    messageInput.value = '';
    resultsDiv.style.display = 'none';
    
    // Smooth transition
    messageInput.focus();
    showNotification('Input cleared', 'info');
}

// Enhanced initialization
function initializeApp() {
    console.log('🚀 Enhanced Spam Detection System initialized');
    console.log('📋 Features: Advanced text preprocessing, pattern matching, confidence scoring');
    console.log('🔧 Version: Enhanced with better accuracy and error handling');
    
    // Add some example test cases for debugging
    console.log('🧪 Test cases to try:');
    console.log('1. "FREE MONEY!!! Click here now!" (Should be spam)');
    console.log('2. "Hello John, how are you today?" (Should not be spam)');
    console.log('3. "Meeting scheduled for tomorrow at 3 PM" (Should not be spam)');
    console.log('4. "CONGRATULATIONS! You won $1,000,000!" (Should be spam)');
    
    // Set focus to input
    document.getElementById('messageInput').focus();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeApp);

// Enhanced keyboard shortcuts
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        analyzeMessage();
    } else if (e.key === 'Escape') {
        clearInput();
    }
});