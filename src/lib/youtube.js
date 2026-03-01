import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extract text transcript from a YouTube video URL
 * @param {string} url - The YouTube video URL
 * @returns {Promise<{text: string, title: string}>} - The extracted text
 */
export async function extractYoutubeTranscript(url) {
  try {
    // Basic validation of the URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      throw new Error('Invalid YouTube URL');
    }

    // Attempt to fetch the transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url);

    // Combine all transcript lines into a single string
    const fullText = transcriptItems.map(item => item.text).join(' ');

    // We don't get the title easily from just the transcript API,
    // so we return a generic title. In a more complex app, we'd use the YouTube Data API.
    return {
      text: fullText,
      title: 'YouTube Video Notes'
    };
  } catch (error) {
    console.error('Error extracting YouTube transcript:', error);

    if (error.message.includes('Transcript is disabled')) {
      throw new Error('Subtitles/Transcripts are disabled for this video.');
    }

    throw new Error('Failed to extract transcript from this YouTube video. It might not have closed captions available.');
  }
}
