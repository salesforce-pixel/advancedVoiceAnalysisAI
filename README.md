# Salesforce Advanced Voice Call Analyzer

**Author:** Rajeev Shekhar  
**Contact:** rshekhar@salesforce.com

An intelligent Salesforce-based solution that leverages AI to analyze voice call transcripts and derive actionable insights for sales and service teams.

---

## 🚀 Prerequisites

Ensure the following tools are installed before getting started:

- **Salesforce CLI (sf CLI):** Latest version  
- **Node.js:** Version 18 or higher  
- **Git:** For version control  

---

## 🧭 Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/salesforce-pixel/advancedVoiceAnalysisAI.git
cd advancedVoiceAnalysisAI
```

### Step 2: Authenticate with Your Salesforce Org

```bash
sf org login web -a targetOrg
```

> **Note:** Replace `targetOrg` with your desired alias for the org.

### Step 3: Enable Required Features in the Org

Make sure the following features are enabled:

- **Generative AI (via Einstein Setup)**
- **Einstein for Sales**
- **Prompt Builder**
- **Service Cloud Voice**

### Step 4: Deploy the Project to Salesforce

```bash
sf project deploy start -x manifest/package.xml -o targetOrg -l NoTestRun
```

> This command deploys the metadata to your target org.

### Step 5: Configure Prompt Templates

After successful deployment, open the following two Prompt Templates (check out the genAiPromptTemplates folder in the codebase) and replace the placeholder comment in both these templates:

> `//Important: Add the Flow that provides Voice Call Transcript to this Prompt Template`

With the appropriate Flow reference:

1. ** XXX Voice Call Exploration**
   ```text
   {!$Flow:Query_Voice_Call_Transcript.Prompt}
   ```

2. ** XXX Voice AI Analysis**
   ```text
   {!$Flow:Query_Voice_Transcript_v2.Prompt}
   ```

✅ Save both as **New Versions** and then **Activate** them.

### Step 6: Make the LWC available on the VoiceCall Object
* Open the VoiceCall record page in Lightning App Builder.
* Find voiceCallInsightViewer LWC, and drag and drop the component in a suitable location.
* Save and Activate

---

## 🧪 Testing the Solution

This is a real solution, but you can test the solution manually by pasting the following JSON into the custom field deployed as a part of the package:

> **Field Name:** `VoiceCall.GenAI_Complete_Raw_Analysis__c`

```json
{
  "CustomerSentiment": "Positive",
  "CallOutcome": "Car Listed for Sale",
  "Summary": "The sales representative greeted the customer warmly and quickly established rapport. They qualified the customer's needs and explained the listing process clearly. The customer showed interest and agreed to list their car by the end of the call.",
  "SalesMethodologyAlignment": {
    "BuildRapport": {
      "status": "Clearly",
      "evidence": "Rep began with friendly small talk and mentioned shared interests in electric vehicles."
    },
    "QualifyCustomer": {
      "status": "Clearly",
      "evidence": "Rep asked about the car model, condition, mileage, and the reason for selling."
    },
    "ExplainProcess": {
      "status": "Clearly",
      "evidence": "Rep walked the customer through the entire listing and selling process step-by-step."
    },
    "HighlightBenefits": {
      "status": "Clearly",
      "evidence": "Rep emphasized that Nettbil handles everything, including buyer communication and payment."
    },
    "HandleObjections": {
      "status": "Partially",
      "evidence": "Customer asked about potential hidden fees; rep responded but did not mention the service fee clearly."
    },
    "Close": {
      "status": "NotAtAll",
      "evidence": "Rep did not explicitly ask for commitment or confirm the listing during the call."
    },
    "ConfirmNextSteps": {
      "status": "Clearly",
      "evidence": "Rep confirmed the customer would upload photos and receive a confirmation email within an hour."
    }
  },
  "TopicsDiscussed": [
    "Listing Process",
    "Service Benefits",
    "Fees",
    "Timeline",
    "Photo Submission"
  ],
  "KeyMoments": [
    {
      "timestamp": "00:00:45",
      "description": "Customer expresses hesitation about selling online.",
      "significance": "Revealed a key concern early in the call that shaped the rest of the discussion."
    },
    {
      "timestamp": "00:02:15",
      "description": "Rep explained how Nettbil ensures price transparency.",
      "significance": "Helped build trust and removed friction around pricing concerns."
    },
    {
      "timestamp": "00:03:30",
      "description": "Rep outlined steps to upload car details and photos.",
      "significance": "Gave the customer clarity on what action to take immediately after the call."
    },
    {
      "timestamp": "00:05:10",
      "description": "Customer raises concern about personal data security.",
      "significance": "Critical for addressing trust and regulatory requirements."
    },
    {
      "timestamp": "00:05:47",
      "description": "Customer agrees to list the vehicle after understanding the process.",
      "significance": "Turning point where customer commits to the service."
    }
  ],
  "ObjectionsRaised": [
    {
      "objection": "Are there any hidden fees I should be aware of?",
      "handledEffectively": false,
      "repResponse": "We make it very easy for sellers and handle everything on your behalf."
    },
    {
      "objection": "How can I be sure the buyers are legitimate?",
      "handledEffectively": true,
      "repResponse": "All buyers go through our verification system and payments are secured by Nettbil."
    },
    {
      "objection": "Is my personal data safe when I upload my documents?",
      "handledEffectively": true,
      "repResponse": "Yes, we use encrypted channels and comply with GDPR to protect all user information."
    }
  ],
  "NextSteps": "Sales rep should follow up via email to ensure the customer submits the vehicle photos and assist if needed.",
  "RepEffectivenessScore": {
    "score": 8,
    "justification": "The rep performed well in most areas, especially in explaining the process and building rapport. However, they failed to clearly close the call with a commitment."
  }
}
```