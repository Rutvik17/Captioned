export const captionsPrompt = (type: string) => 
    `Please generate three different types of captions for the given ${type === 'photo' ? 'image' : 'video'}. Each caption should include relevant emojis and hashtags. The captions should be based on the content of the ${type === 'photo' ? 'image' : 'video'}. The response should be in JSON format, with an array of captions.
        1. Minimalist Caption: A short and concise caption.
        2. Short Sentence Caption: A brief sentence describing the ${type === 'photo' ? 'image' : 'video'}.
        3. Detailed Caption: A more descriptive and detailed caption.
        Format:
        {
            "captions": [
            {
                "type": "minimalist",
                "caption": "<caption_with_emojis_and_hashtags>"
            },
            {
                "type": "short_sentence",
                "caption": "<caption_with_emojis_and_hashtags>"
            },
            {
                "type": "detailed",
                "caption": "<caption_with_emojis_and_hashtags>"
            }
            ]
        }
        Please use the provided format.
    `