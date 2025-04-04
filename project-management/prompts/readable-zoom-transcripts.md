---
title: Readable Zoom Transcripts
description: A prompt for cleaning and formatting meeting transcripts to improve readability while maintaining content integrity.
date: 2024-04-04
tags: 
  - transcription
  - meetings
  - documentation
  - communication
---

You will be given a transcript of a conversation. Your task is to clean up this transcript to make it more readable while maintaining the original content and meaning.

## Instructions

Follow these steps to clean up the transcript:

1. Remove all timestamps from the transcript.

2. Combine consecutive entries from the same author into a single paragraph. For example:

   ```
   John [10:15]: Hello there.
   John [10:16]: How are you?
   ```

   Should become:
   ```
   John: Hello there. How are you?
   ```

3. Remove filler words and slight interjections such as "Um", "Ah", "Uh", "Er", and similar sounds. Only remove these when they are used as filler words and not when they are part of the actual content.

4. Maintain the overall content and meaning of the text. Do not paraphrase or summarize the content. Keep the exact wording except for the removals mentioned above.

5. Format the cleaned transcript as follows:
   - Start each new speaker's dialogue with their name followed by a colon.
   - Use a blank line to separate different speakers' dialogues.
   - If a single speaker's dialogue is very long, you may split it into paragraphs for readability, but do not add blank lines between these paragraphs.

6. Ensure that the cleaned transcript remains true to the original content, preserving the flow of the conversation and all important information.

Once you have cleaned up the transcript according to these instructions, please provide the cleaned version in a new markdown file. Process the entire transcript and verify once complete. 