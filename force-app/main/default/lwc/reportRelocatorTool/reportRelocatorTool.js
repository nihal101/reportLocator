import { LightningElement } from 'lwc';
// Import Apex Class methods
import moveSelectedReportToFolder from '@salesforce/apex/ReportRelocatorController.moveSelectedReportToFolder';
import getUpdatedReportList from '@salesforce/apex/ReportRelocatorController.getUpdatedReportList';
// Import show toast
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ReportRelocatorTool extends LightningElement {

    isReportByFolder = false;
    isAllReport = false;
    showSpinner;
    selectedReportInfo;
    showConfirmationScreen = false;
    showResultScreen = false;
    jobId;
    isReportDeployed = false;
    title = "Review the changes..."

    get isSelectedReportAvailble() {
        return this.selectedReportInfo && this.selectedReportInfo.length > 0;
    }

    handleReportFilter(event) {
        this.isReportByFolder = event.detail.isReportByFolder;
        this.isAllReport = event.detail.isAllReport;
    }

    showLoading() {
        this.showSpinner = true;
    }

    hideLoading() {
        this.showSpinner = false;
    }

    handleFolderSelection(event) {
        let reportScreenEle = this.template.querySelectorAll("c-report-screen");
        if(reportScreenEle && this.isReportByFolder == true && event.detail.type == "fromReport") {
            reportScreenEle[0].getReportForSelectedFolder(event.detail.rows);
        }else if(reportScreenEle && this.isReportByFolder == true && event.detail.type == "toReport") {
            reportScreenEle[0].setFolderForSelectedReport(event.detail.rows)
        }else if(reportScreenEle && this.isAllReport == true && event.detail.type == "toReport") {
            reportScreenEle[0].setFolderForSelectedReport(event.detail.rows)
        }
    }

    handleSelectedReport(event) {
        this.selectedReportInfo = event.detail.selectedReportInfo;
        let welcomeScreenEle = this.template.querySelectorAll("c-welcome-screen");
        if(welcomeScreenEle && this.selectedReportInfo.length > 0) {
            welcomeScreenEle[0].showReportDeployAction(this.selectedReportInfo.length);
        }else if(welcomeScreenEle && this.selectedReportInfo.length <= 0) {
            welcomeScreenEle[0].showReportOptionAction();
        }
    }

    handleConfirmScreenVisiblity() {
        this.showConfirmationScreen = true;
    }

    hideConfirmationScreenModal() {
        this.showConfirmationScreen = false;
        if(this.isReportDeployed == true) {
            this.isAllReport = false;
            this.isReportByFolder = false;
            this.isReportDeployed = false;
            this.selectedReportInfo = null;
        }
    }

    handleSave() {
        this.hideConfirmationScreenModal();
        this.showLoading();
        moveSelectedReportToFolder({stringifyReports : JSON.stringify(this.selectedReportInfo)}).then(result => {
            if(result.isSuccess) {
                this.jobId = result.reportLogId;
                this.showResultScreen = true;
            }else {
                console.log(result.message);
            }
            this.hideLoading();
        }).catch(error => {
            console.log("error", JSON.stringify(error));
            this.error = error;
            this.hideLoading();
        })
    }

    hideResultScreen() {
        let reportScreenEle = this.template.querySelectorAll("c-report-screen");
        if(reportScreenEle) {
            reportScreenEle[0].refreshReportScreen();
            this.showLoading();
            getUpdatedReportList({reportIds : this.selectedReportInfo.map(report => report.reportId)}).then(response => {
                if(response.isSuccess) {
                    response.reports.forEach(currentItem => {
                        currentItem.currentFolderDisplay = currentItem.oldFolderName.displayName;
                        currentItem.newFolderDisplay = currentItem.oldFolderName.displayName;
                    });
                    this.selectedReportInfo = [... response.reports];
                    this.showResultScreen = false;
                    this.title = "Verify the updates..."
                    this.handleConfirmScreenVisiblity();
                    this.isReportDeployed = true;
                }
                this.hideLoading();
            }).catch(error => {
                console.log("error", JSON.stringify(error));
                this.error = error;
                this.hideLoading();
            })
        }
    }

    handleShowToast(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: event.detail.title,
            message: event.detail.message,
            variant: event.detail.variant,
            mode: event.detail.mode
        }));
    }
}