import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import exploreConversation from '@salesforce/apex/NettbilVoiceExplorationAI.exploreConversation';

const FIELDS = ['VoiceCall.GenAI_Complete_Raw_Analysis__c'];

export default class VoiceCallInsightViewer extends LightningElement {
    @api recordId;
    data;
    methodologyRows = [];
    showActionButtons = false;
    showJsonModal = false;
    showExploreModal = false;
    rawJsonData = '';
    userQuestion = '';
    exploreAnswer = '';
    isExploring = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredVoiceCall({ error, data }) {
        if (data) {
            try {
                const raw = data.fields.GenAI_Complete_Raw_Analysis__c.value;
                this.rawJsonData = raw;
                this.data = JSON.parse(raw);
                this.processMethodologyData();
                this.enhanceObjectionsData();
                this.checkForActionButtons();
            } catch (e) {
                console.error('Failed to parse GenAI JSON:', e);
                this.data = null;
            }
        } else if (error) {
            console.error('Error retrieving VoiceCall:', error);
            this.data = null;
        }
    }

    processMethodologyData() {
        if (!this.data?.SalesMethodologyAlignment) return;
        
        const sm = this.data.SalesMethodologyAlignment;
        this.methodologyRows = Object.keys(sm).map(key => {
            const status = sm[key].status;
            return {
                step: this.formatStep(key),
                status: status,
                statusLabel: this.getStatusLabel(status),
                evidence: sm[key].evidence,
                iconName: this.getStepIcon(status)
            };
        });
    }

    enhanceObjectionsData() {
        if (!this.data?.ObjectionsRaised) return;
        
        this.data.ObjectionsRaised = this.data.ObjectionsRaised.map(objection => {
            return {
                ...objection,
                handlingLabel: objection.handledEffectively ? 'Handled Successfully' : 'Needs Improvement',
                statusIcon: objection.handledEffectively ? 'utility:check' : 'utility:close',
                iconName: objection.handledEffectively ? 'utility:success' : 'utility:warning'
            };
        });
    }

    checkForActionButtons() {
        if (!this.data?.SalesMethodologyAlignment) return;
        
        const sm = this.data.SalesMethodologyAlignment;
        this.showActionButtons = Object.values(sm).some(step => 
            step.status === 'Partially' || step.status === 'NotAtAll'
        );
    }

    formatStep(key) {
        const map = {
            BuildRapport: 'Build Rapport',
            QualifyCustomer: 'Qualify Customer', 
            ExplainProcess: 'Explain Process',
            HighlightBenefits: 'Highlight Benefits',
            HandleObjections: 'Handle Objections',
            Close: 'Call to Action / Close',
            ConfirmNextSteps: 'Confirm Next Steps'
        };
        return map[key] || key;
    }

    getStatusLabel(status) {
        const map = {
            'Clearly': 'Executed Well',
            'Partially': 'Partially Done', 
            'NotAtAll': 'Missing'
        };
        return map[status] || status;
    }

    getStepIcon(status) {
        switch (status) {
            case 'Clearly':
                return 'utility:success';
            case 'Partially':
                return 'utility:warning';
            case 'NotAtAll':
                return 'utility:error';
            default:
                return 'utility:question_mark';
        }
    }

    get effectivenessBarStyle() {
        if (!this.data?.RepEffectivenessScore?.score) return 'width: 0%';
        const percentage = (this.data.RepEffectivenessScore.score / 10) * 100;
        return `width: ${percentage}%`;
    }

    get formattedJsonData() {
        try {
            return JSON.stringify(JSON.parse(this.rawJsonData), null, 2);
        } catch (e) {
            return this.rawJsonData;
        }
    }

    get isSubmitDisabled() {
        return !this.userQuestion.trim() || this.isExploring;
    }

    // Event Handlers
    handleScheduleMeeting() {
        // Placeholder for scheduling logic
        console.log('Schedule Meeting clicked');
        // You can dispatch custom event or call Apex method here
        this.dispatchEvent(new CustomEvent('schedulemeeting', {
            detail: { recordId: this.recordId }
        }));
    }

    handleEnrollToEnablement() {
        // Placeholder for enablement enrollment logic
        console.log('Enroll to Enablement clicked');
        // You can dispatch custom event or call Apex method here
        this.dispatchEvent(new CustomEvent('enrolltoenablement', {
            detail: { recordId: this.recordId }
        }));
    }

    handleShowJson() {
        this.showJsonModal = true;
    }

    handleCloseJsonModal() {
        this.showJsonModal = false;
    }

    handleCopyJson() {
        const jsonText = this.template.querySelector('.json-content').textContent;
        navigator.clipboard.writeText(jsonText).then(() => {
            // Show success message
            console.log('JSON copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy JSON:', err);
        });
    }

    handleExportInsights() {
        // Placeholder for export functionality
        console.log('Export Insights clicked');
        this.dispatchEvent(new CustomEvent('exportinsights', {
            detail: { data: this.data, recordId: this.recordId }
        }));
    }

    handleRefreshAnalysis() {
        // Placeholder for refresh functionality
        console.log('Refresh Analysis clicked');
        this.dispatchEvent(new CustomEvent('refreshanalysis', {
            detail: { recordId: this.recordId }
        }));
    }

    // New Explore Conversation Event Handlers
    handleExploreConversation() {
        this.showExploreModal = true;
        this.userQuestion = '';
        this.exploreAnswer = '';
    }

    handleCloseExploreModal() {
        this.showExploreModal = false;
        this.userQuestion = '';
        this.exploreAnswer = '';
        this.isExploring = false;
    }

    handleQuestionChange(event) {
        this.userQuestion = event.target.value;
    }

    async handleSubmitQuestion() {
        if (!this.userQuestion.trim()) {
            this.showToast('Error', 'Please enter a question.', 'error');
            return;
        }

        this.isExploring = true;
        this.exploreAnswer = '';

        try {
            const response = await exploreConversation({ 
                voiceId: this.recordId, 
                query: this.userQuestion.trim() 
            });
            
            this.exploreAnswer = response || 'No response received from AI.';
        } catch (error) {
            console.error('Error calling exploreConversation:', error);
            this.exploreAnswer = 'Sorry, there was an error processing your request. Please try again.';
            this.showToast('Error', 'Failed to get AI response. Please try again.', 'error');
        } finally {
            this.isExploring = false;
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}