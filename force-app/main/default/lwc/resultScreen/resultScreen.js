import { LightningElement, api } from 'lwc';
// Import Apex Class methods
import getJobStatus from '@salesforce/apex/ReportRelocatorController.getJobStatus';

export default class ResultScreen extends LightningElement {

    @api jobId;
    result;
    showSpinner = true;

    connectedCallback() {
        this.fetchJobDetails();
    }

    handleJobStatusRefresh() {
        this.fetchJobDetails();
    }

    fetchJobDetails() {
        this.showSpinner = true;
        getJobStatus({jobId : this.jobId}).then(result => {
            if(result) {
                this.result = result;
            }else {
                this.result = {
                    "ExtendedStatus" : "No Queuued Job has been found."
                }
            }
            this.showSpinner = false;
        }).catch(error => {
            console.log("Getting error");
            this.showSpinner = false;
        });
    }

    closeScreen() {
        this.dispatchEvent(new CustomEvent("closeresultscreen"));
    }
}