import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { CurrentPageReference } from 'lightning/navigation';
import STATUS_FIELD from '@salesforce/schema/Ethics_Request__c.I_RS_Status__c';

const STATUS_CONFIG = [
    { status: 'Draft', guidanceKey: 'draft' },
    { status: 'eForm in Progress', guidanceKey: 'eform' },
    { status: 'Review by Research Office', guidanceKey: 'reviewOffice' },
    { status: 'Researcher actions required', guidanceKey: 'researcherActions' },
    { status: 'Assigned for committee review', guidanceKey: 'committeeReview' },
    { status: 'Open for Comments', guidanceKey: 'openComments' },
    { status: 'Approved', guidanceKey: 'approved' },
    { status: 'Expired', guidanceKey: 'expired' },
    { status: 'Closed', guidanceKey: 'closed' }
];

export default class EthicsRequestPath extends LightningElement {
    @api recordId;

    statusValue;

    stages = [];
    currentGuidanceKey;
    pathReady = false;
    errorMessage;

    // 🔹 0) Fallback for portal: read recordId from URL if not injected
    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (!pageRef || this.recordId) {
            return;
        }

        const state = pageRef.state || {};
        const attrs = pageRef.attributes || {};

        const urlId =
            state.recordId ||
            state.c__recordId ||
            attrs.recordId ||
            null;

        if (urlId) {
            this.recordId = urlId;
            // eslint-disable-next-line no-console
            console.log('EthicsRequestPath: recordId from URL =', this.recordId);
            this.buildPath(); // try building now that we have an Id
        }
    }

    // 🔹 1) Current Status from record
    @wire(getRecord, { recordId: '$recordId', fields: [STATUS_FIELD] })
    wiredRecord({ data, error }) {
        if (data) {
            this.statusValue = data.fields.I_RS_Status__c.value;
            this.errorMessage = null;
            // eslint-disable-next-line no-console
            console.log('EthicsRequestPath: statusValue =', this.statusValue);
            this.buildPath();
        } else if (error) {
            this.statusValue = null;
            this.pathReady = false;
            this.errorMessage = 'Error loading record data';
            // eslint-disable-next-line no-console
            console.log('EthicsRequestPath: record error', JSON.parse(JSON.stringify(error)));
        }
    }

    buildPath() {
        // Still waiting on something → loading
        if (!this.recordId || !this.statusValue) {
            this.pathReady = false;
            return;
        }

        const stages = [];
        let passedCurrent = false;

        STATUS_CONFIG.forEach(cfg => {
            const value = cfg.status;
            const isCurrent = value === this.statusValue;
            const isComplete = !isCurrent && !passedCurrent;
            const isFuture = !isCurrent && passedCurrent;

            let cssClass = 'slds-path__item';
            if (isCurrent) {
                cssClass += ' slds-is-current slds-is-active';
            } else if (isComplete) {
                cssClass += ' slds-is-complete';
            } else {
                cssClass += ' slds-is-incomplete';
            }

            stages.push({
                label: value,
                value,
                isCurrent,
                isComplete,
                isFuture,
                cssClass
            });

            if (isCurrent) {
                passedCurrent = true;
            }
        });

        this.stages = stages;

        const currentCfg = STATUS_CONFIG.find(cfg => cfg.status === this.statusValue);
        this.currentGuidanceKey = currentCfg ? currentCfg.guidanceKey : null;

        // ✅ Everything ready
        this.pathReady = true;
        // eslint-disable-next-line no-console
        console.log('EthicsRequestPath: pathReady =', this.pathReady);
    }

    get hasGuidance() {
        return !!this.currentGuidanceKey;
    }

    // 🔹 show loading only if not ready and no error
    get showLoading() {
        return !this.pathReady && !this.errorMessage;
    }

    get showDraftGuidance() {
        return this.currentGuidanceKey === 'draft';
    }

    get showEformGuidance() {
        return this.currentGuidanceKey === 'eform';
    }

    get showResearchOfficeGuidance() {
        return this.currentGuidanceKey === 'reviewOffice';
    }

    get showResearcherActionsGuidance() {
        return this.currentGuidanceKey === 'researcherActions';
    }

    get showCommitteeReviewGuidance() {
        return this.currentGuidanceKey === 'committeeReview';
    }

    get showOpenCommentsGuidance() {
        return this.currentGuidanceKey === 'openComments';
    }

    get showApprovedGuidance() {
        return this.currentGuidanceKey === 'approved';
    }

    get showExpiredGuidance() {
        return this.currentGuidanceKey === 'expired';
    }

    get showClosedGuidance() {
        return this.currentGuidanceKey === 'closed';
    }
}