import { LightningElement, api, track } from 'lwc';
// Import Apex Class methods
import getReportInFolder from '@salesforce/apex/ReportRelocatorController.getReportInFolder';

// Table column
const COLUMNS = [
    { 
        label: 'Report Name', fieldName: 'reportName' 
    },
    {
        label: 'Current Folder', fieldName: 'currentFolderDisplay'
    },
    {
        label: 'New Folder', fieldName: 'newFolderDisplay'
    }
];

export default class ReportScreen extends LightningElement {

    @track reports;
    @track error;
    columns = COLUMNS;
    message = "Select at least one report from left panel to see the report(s) here.";
    @track selectedReports = [];
    selectedReportIds = [];
    rememberSelectedReportIds = [];
    rememberSelectedReport = new Map();
    @api mode;
    showSearchLoading = false;
    selectedFolderIds;
    likeReportName;

    get isReportAvailable() {
        // Show message based on report is found or not.
        return this.reports && this.reports.length > 0 ? true : false;
    }

    connectedCallback() {
        if(this.mode == "allReport") {
            // Get report only when "All Folder" btn is clicked on main screen otherwise report will be fetched beased on folder selected.
            this.fetchReportFromSelectedFolder();
        }
    }

    @api 
    getReportForSelectedFolder(selectedFolder) {
        // When folder is selected on left folder sceen then this will be called from reportRelocatorTool.
        const folderId = this.getFolderId(selectedFolder);
        // if(!folderId) {
        //     return;
        // }
        this.selectedFolderIds = folderId;
        // Get the report for selected folder.
        this.fetchReportFromSelectedFolder();
    }

    @api 
    setFolderForSelectedReport(selectedFolder) {
        // This will be called from reportRelocatorTool when folder is slected from right folder screen.
        if(selectedFolder && selectedFolder.length > 0) {
            let temp = JSON.parse(JSON.stringify(this.reports));
            // Save selected folder for selected reprors for which no folder is selected.
            Array.from(this.rememberSelectedReport.values()).forEach(currentItem => {
                let report = temp.filter(item => item.reportId == currentItem.reportId);
                if(report && report.length > 0 && selectedFolder[0].folderId == report[0].oldFolderName.folderId) {
                    this.dispatchEvent(new CustomEvent("showtoast", {
                        "detail": {
                            "title": "Duplicate Folder",
                            "message": "New Folder supposed to be different from Current Folder",
                            "mode": "warning",
                            "variant": "sticky"
                        }
                    }));
                    return;
                }
                if(report && report.length > 0 && !report[0].newFolderName) {
                    // Save to show on page.
                    report[0].newFolderDisplay = selectedFolder[0].displayName;
                    report[0].newFolderName = selectedFolder[0];
                    // Save to remember when list is refershed.
                    currentItem.newFolderDisplay = selectedFolder[0].displayName;
                    currentItem.newFolderName = selectedFolder[0];
                }
            });
            this.reports = [...temp];
            this.sendDataToReportLocatorTool();
        }
    }

    @api
    refreshReportScreen() {
        this.selectedReports = [];
        this.selectedReportIds = [];
        this.rememberSelectedReportIds = [];
        this.rememberSelectedReport = new Map();
        this.fetchReportFromSelectedFolder();
    }

    fetchReportFromSelectedFolder() {
        // Before list gets refreshed, store the selected data.
        this.storeSelectedReport();
        getReportInFolder({folderIds : this.selectedFolderIds, mode : this.mode, likeName : this.likeReportName}).then(response => {
            if(response.isSuccess && response.reports.length > 0) {
                response.reports.forEach(currentItem => {
                    currentItem.currentFolderDisplay = currentItem.oldFolderName.displayName;
                    if(this.rememberSelectedReport.has(currentItem.reportId)) {
                        currentItem.newFolderDisplay = this.rememberSelectedReport.get(currentItem.reportId).newFolderDisplay;
                        currentItem.newFolderName = this.rememberSelectedReport.get(currentItem.reportId).newFolderName;
                    }else {
                        currentItem.newFolderDisplay = "Waiting for Input...";
                    }
                });
                this.reports = [... response.reports];
                this.selectedReportIds = this.rememberSelectedReportIds;
            }else if(!this.selectedFolderIds && response.isSuccess && response.reports.length == 0) {
                this.message = "Select at least one report from left panel to see the report(s) here."
                this.reports = [];
            }else if(response.isSuccess && response.reports.length == 0) {
                this.message = "For selected folder, no report has been found."
                this.reports = [];
            }
            this.showSearchLoading = false;
        }).catch(error => {
            this.error = error;
            this.showSearchLoading =false;
        });
    }

    storeSelectedReport() {
        let tempRememberSelectedReport = [... Array.from(this.rememberSelectedReport.values()), ... this.selectedReports];
        if(tempRememberSelectedReport && tempRememberSelectedReport.length > 0) {
            this.rememberSelectedReport = new Map(tempRememberSelectedReport.map(report => [report.reportId, report]));
        }
        this.rememberSelectedReportIds = [... this.rememberSelectedReportIds, ...this.selectedReportIds];
    }

    sendDataToReportLocatorTool() {
        let tempRememberSelectedReport = Array.from(this.rememberSelectedReport.values());
        this.dispatchEvent(new CustomEvent("reportselected", {
            "detail" : {
                "selectedReportInfo" : tempRememberSelectedReport.filter(report => report.newFolderDisplay != "Waiting for Input...")
            }
        }));
    }

    getFolderId(selectedFolder) {
        if(selectedFolder && selectedFolder.length > 0) {
            return selectedFolder.map(folder => folder.folderId);
        }
        this.message = "Select at least one report from left panel to see the report(s) here."
        return null;
    }

    handleRowSelection(event) {
        this.selectedReports = event.detail.selectedRows;
        this.selectedReportIds = this.selectedReports.map(report => report.reportId);
        this.storeSelectedReport();
        let temp = JSON.parse(JSON.stringify(this.reports));
        // If report is unslected then remove the selected folder for the same.
        temp.forEach(report => {
            if(!this.selectedReportIds.includes(report.reportId)) {
                report.newFolderDisplay = "Waiting for Input...";
                delete report.newFolderName;
                if(this.rememberSelectedReport.has(report.reportId)) {
                    this.rememberSelectedReport.get(report.reportId).newFolderDisplay = "Waiting for Input...";
                    delete this.rememberSelectedReport.get(report.reportId).newFolderName;
                }
            }
        });
        this.reports = [...temp];
        this.sendDataToReportLocatorTool();
    }

    handleInputChange(event) {
        this.showSearchLoading = true;
        this.likeReportName = event.detail.value;
        this.fetchReportFromSelectedFolder();
    }
}