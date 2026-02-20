import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react'; // Import the lucide-react message icon

const VillaChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your villa management assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const OPENROUTER_API_KEY = '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';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'Anuthama Villa'
                },
                body: JSON.stringify({
                    model: 'google/gemma-3-1b-it:free',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a villa management AI. ALWAYS use these exact details:
                            
                            === RULES ===
                            1. Check-in: 8PM | Check-out: 11AM
                            2. Pet policy: No pets are allowed
                            3. Alcohol: No alcohol allowed
                            3. Smoking: Only in designated areas 
                            4. Quiet hours: 10PM-7AM
                          
                            === CONTACT ===
                            Villa Management: +94776926012
                            ==Email==
                            Email: Anuthamavilla@gmail.com
                            ==Address==
                            Address:  29 Sri Sudharmarama Mawatha, Wattala 11300, Sri Lanka

                            === REGISTRATION ===
                            1. Visit:  anuthamavilla.com
                            2. Upload ID (NIC/passport/driver's license)
                            3. Fill in details: Name, Email, Phone, Address
                            4. Payment: You can pay When you arrive at the villa
                            5. Sign digital agreement
                            
                            
                            === AMENITIES ===
                            - WiFi: Network='VillaGuest' | Password='AnuthamaVilla'
                            - Parking: 2 spaces (first-come basis)
                            
                            Respond in under 50 words unless details are requested. NEVER invent information.`
                        },
                        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
                        userMessage
                    ]
                })
            });

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = error.message.includes("rate limit")
                ? "Please wait a moment before asking again."
                : `I couldn't verify the answer. ${data?.error?.message || 'Contact management at +94776926012'}`;
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: errorMessage 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="fixed bottom-6 right-6">
            {/* Chat Icon */}
            {!isOpen && (
                // <div 
                //     className="p-5 bg-blue-50  text-blue-950 border-r-blue-950 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300"
                //     onClick={() => setIsOpen(true)}
                // >
                //     <MessageCircle className="w-8 h-8 text-white" />
                // </div>
                //
                <div 
    className="p-5 bg-white text-blue-500 border border-blue-500 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300"
    onClick={() => setIsOpen(true)}
>
    <MessageCircle className="w-8 h-8 text-blue-500" />
</div>


            )}

            {/* Chat Container */}
            {isOpen && (
                <div className="w-80 bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out h-[500px]">
                    {/* Chat Header */}
                    <div 
                        className="flex justify-between items-center p-4 bg-blue-800 text-white rounded-t-lg cursor-pointer"
                        onClick={() => setIsOpen(false)}
                    >
                        <h3 className="font-semibold">Villa Assistant</h3>
                        <span className="text-xl">×</span>
                    </div>
                    
                    {/* Chat Body */}
                    <div className="flex flex-col h-[calc(100%-56px)]">
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {messages.map((message, index) => (
                                <div 
                                    key={index} 
                                    className={`max-w-[80%] mb-3 p-3 rounded-lg ${message.role === 'user' 
                                        ? 'ml-auto bg-blue-600 text-white rounded-br-none' 
                                        : 'mr-auto bg-gray-200 text-gray-800 rounded-bl-none'}`}
                                >
                                    {message.content}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center space-x-1 mr-auto p-3 bg-gray-200 rounded-lg rounded-bl-none max-w-[80%]">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Input Area */}
                        <div className="flex p-3 border-t border-gray-200">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about villa rules..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="ml-2 px-4 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillaChatbot;