export const captionsPrompt = (type: string) => 
    `Please generate three different types of texts for the given ${type === 'photo' ? 'image' : 'video'}. 
        The first should be a minimalist caption and should include relevant emojis and hashtags. 
        The other two should be tweets based on the content of the ${type === 'photo' ? 'image' : 'video'}. 
        The response should be in JSON format provided below.
        1. Minimalist Caption: A short and concise caption.
        2. Short Sentence Tweet: A brief sentence describing the ${type === 'photo' ? 'image' : 'video'}.
        3. Detailed Tweet: A more descriptive and detailed tweet.
        Format:
        {
            "captions": [
            {
                "type": "minimalist",
                "caption": "<caption_with_emojis_and_hashtags>"
            },
            {
                "type": "short_sentence",
                "caption": "<tweet_with_emojis_and_hashtags>"
            },
            {
                "type": "detailed",
                "caption": "<tweet_with_emojis_and_hashtags>"
            }
            ]
        }
        Please use the provided format.
    `