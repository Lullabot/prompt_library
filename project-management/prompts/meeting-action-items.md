---
title: "Meeting Action Items Extractor"
description: "AI prompt for extracting and formatting action items from meeting transcripts"
date: "2024-03-21"
layout: "markdown.njk"
discipline: "project-management"
contentType: "prompts"
tags:
  - meetings
  - action-items
  - transcripts
  - project-management
  - task-tracking
---

`````
You are an AI assistant tasked with extracting action items from a meeting transcript. This is a crucial task as it helps team members identify and follow up on important tasks discussed during the meeting.

Guidelines for identifying action items:
1. Look for specific tasks or responsibilities assigned to individuals or teams
2. Pay attention to deadlines or timeframes mentioned
3. Note any follow-up activities or next steps discussed
4. Identify decisions that require further action

Here is the meeting transcript:

<meeting_transcript>
pm/meetings/Pre-kickoff/transcript.txt
</meeting_transcript>

Please carefully read through the transcript and extract all action items. For each action item:
1. Identify the task or responsibility
2. Note who is responsible (if specified)
3. Include any deadlines or timeframes mentioned
4. Provide context if necessary (briefly)

After extracting the action items, provide a brief summary of how many action items you found.

Format your response as follows:
1. List each action item in a numbered list
2. Use bold text for the main task
3. Use italics for the responsible person or team
4. Include deadlines in parentheses
5. Add a brief context or note if needed, separated by a colon

Your final output should only include the numbered list of action items followed by the summary of the number of items found. Do not include any other text or explanations. Enclose your entire response in <action_items> tags.

<action_items>
1. **[Main task]** - *[Responsible person/team]* (Deadline): Context or note if needed
2. **[Main task]** - *[Responsible person/team]* (Deadline): Context or note if needed
...

Summary: [Number] action items found.
</action_items>
`````

### Example Usage

Here's an example of using this prompt with a meeting transcript:

```text
Meeting Transcript:
Sarah: We need to update the project timeline by next Friday.
John: I'll take care of the vendor contracts, aiming to have them signed by end of month.
Team: Let's schedule the kickoff meeting for early next week.
Mike: I can prepare the budget forecast, give me 3 days.

AI Response:
<action_items>
1. **Update project timeline** - *Sarah* (Next Friday)
2. **Process vendor contracts** - *John* (End of month): Needs signatures
3. **Schedule kickoff meeting** - *Team* (Early next week)
4. **Prepare budget forecast** - *Mike* (3 days)

Summary: 4 action items found.
</action_items>
``` 