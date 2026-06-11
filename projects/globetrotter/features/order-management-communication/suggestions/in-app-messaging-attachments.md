---
title: "Enhance In-App Messaging with File Attachment Support"
desc: "Enable users to attach images and other relevant files within the in-app messaging system for orders."
status: "open"
source: "internal"
impact: "medium"
relatedStorySlugs: []
updatedAt: "2026-06-11"
---

## Context

Effective communication often requires more than just text. Shoppers might need to share reference images of the desired item, while Locals may need to send photos of the purchased item, proof of purchase (receipts), or images of packaging for confirmation. The current text-only messaging limits this crucial exchange of information.

## Suggested Action

Integrate file attachment capabilities into the existing in-app messaging system. This should support common image formats (JPEG, PNG) and potentially PDF for documents. Implementation involves developing a secure file upload mechanism, storing files (e.g., on cloud storage like AWS S3 or Google Cloud Storage), and displaying these attachments within the chat interface.

## Impact Assessment

**Positive:**
*   **Clarity:** Enables visual confirmation and reduces miscommunication.
*   **Efficiency:** Streamlines information exchange that would otherwise require external channels.
*   **Dispute Resolution:** Provides concrete evidence for claims (e.g., damaged item, incorrect purchase).
*   **User Experience:** Enhances overall communication utility.

**Negative:**
*   **Development Effort:** Requires significant back-end (storage, security) and front-end (UI for upload/display) work.
*   **Storage Costs:** Associated costs with storing user-uploaded files.
*   **Moderation:** Potential need for moderation of inappropriate content if non-image file types are allowed.
