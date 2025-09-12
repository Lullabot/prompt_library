---
title: "Meeting Facilitator Agent"
description: "An AI agent that helps facilitate meetings by taking notes, tracking action items, and managing follow-ups."
date: "2024-12-19"
layout: "markdown.njk"
discipline: "project-management"
contentType: "agents"
tags:
  - meetings
  - facilitation
  - action-items
  - follow-up
  - project-management
---

`````
# Meeting Facilitator Agent

## Agent Configuration

```yaml
name: "MeetingFacilitator"
version: "1.0.0"
description: "AI agent for meeting facilitation and follow-up management"

capabilities:
  - real_time_transcription
  - action_item_extraction
  - participant_tracking
  - follow_up_management
  - summary_generation

settings:
  meeting_types:
    - daily_standup
    - sprint_planning
    - retrospective
    - client_meeting
    - team_sync
  
  features:
    auto_transcription: true
    action_item_detection: true
    participant_speaking_time: true
    agenda_tracking: true
    follow_up_reminders: true
  
  integrations:
    calendar: "google_calendar"
    task_manager: "jira"
    communication: "slack"
    storage: "google_drive"

triggers:
  - event: "meeting.started"
  - event: "meeting.ended"
  - time_based: "daily_reminder"

workflows:
  pre_meeting:
    - send_agenda_reminder
    - check_participant_availability
    - prepare_meeting_space
  
  during_meeting:
    - transcribe_conversation
    - identify_action_items
    - track_decisions
    - monitor_time
  
  post_meeting:
    - generate_summary
    - distribute_notes
    - create_follow_up_tasks
    - schedule_reminders
```

## Usage Instructions

1. Install the agent in your meeting platform (Zoom, Teams, Google Meet)
2. Configure integrations with your project management tools
3. Set up participant preferences and notification settings
4. Train the agent on your specific meeting formats and terminology

## Features

### Real-time Facilitation
- **Transcription**: Automatically transcribe meeting conversations
- **Action Items**: Identify and extract action items as they're discussed
- **Time Management**: Track agenda items and notify about time limits
- **Participation**: Monitor speaking time and encourage balanced participation

### Post-Meeting Automation
- **Summary Generation**: Create structured meeting summaries
- **Task Creation**: Automatically create tasks in your project management system
- **Follow-up Scheduling**: Schedule reminder emails and check-ins
- **Documentation**: Store notes and recordings in designated locations

### Analytics & Insights
- **Meeting Efficiency**: Track meeting duration vs. agenda completion
- **Participation Metrics**: Analyze team member engagement
- **Action Item Completion**: Monitor follow-through on commitments
- **Meeting Patterns**: Identify trends and optimization opportunities

## Integration Examples

```yaml
# Slack Integration
slack:
  post_summary: true
  remind_action_items: true
  daily_digest: true

# Jira Integration  
jira:
  create_tickets: true
  link_to_epic: true
  assign_automatically: true

# Google Calendar Integration
calendar:
  block_follow_up_time: true
  schedule_reminders: true
  update_meeting_notes: true
```
`````