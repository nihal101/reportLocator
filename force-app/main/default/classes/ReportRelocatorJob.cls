/**
* @File Name : ReportRelocatorJob.cls
* @Description : This class is used to enqueue the job to move report to new folder
* @Author :
* @Last Modified By :
* @Last Modified On : February 17, 2025
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | February 17, 2025 |   | Initial Version
**/

public class ReportRelocatorJob implements Queueable, Database.AllowsCallouts {

	public String stringifyReports;

	public ReportRelocatorJob(String stringifyReports) {
		this.stringifyReports = stringifyReports;
	}

	public void execute(QueueableContext context){
		transferReportToNewFolder(this.stringifyReports);
	}

	public void transferReportToNewFolder(String stringifyReports) {
		List<ReportRelocatorResponse.Report> reports = (List<ReportRelocatorResponse.Report>)JSON.deserialize(stringifyReports, List<ReportRelocatorResponse.Report>.class);
		Set<String> oldFolderIds = new Set<String>();
		for(ReportRelocatorResponse.Report report : reports) {
			if(report.oldFolderName != null && String.isNotBlank(report.oldFolderName.folderId)) {
				oldFolderIds.add(report.oldFolderName.folderId);
			}
		}
		Map<String, Folder> idToFolder = new Map<String, Folder>(
			[ SELECT Id, DeveloperName FROM Folder WHERE Id IN : oldFolderIds]
		);
		List<String> reportPathNeedToRead = new List<String>();
		Map<String, String> reportNameToNewFolder = new Map<String, String>();
		for(ReportRelocatorResponse.Report report : reports) {
			if(report.oldFolderName != null && String.isNotBlank(report.oldFolderName.folderId) && report.oldFolderName.displayName == 'Public Reports') {
				reportPathNeedToRead.add('unfiled$public' + '/' + report.developerName);
			}else if(report.oldFolderName != null && String.isNotBlank(report.oldFolderName.folderId) && idToFolder.containsKey(report.oldFolderName.folderId)) {
				reportPathNeedToRead.add(idToFolder.get(report.oldFolderName.folderId).DeveloperName + '/' + report.developerName);
			}
			if(report.oldFolderName != null && String.isNotBlank(report.newFolderName.developerName)) {
				reportNameToNewFolder.put(report.developerName, report.newFolderName.developerName);
			}
		}
		if(reportPathNeedToRead.isEmpty()) {
			return;
		}
		System.debug(reportPathNeedToRead);
		MetadataService.MetadataPort service = createService();
		// Read Report
    	MetadataService.Metadata[] reportMetadata = service.readMetadata('Report', reportPathNeedToRead).getRecords();
		List<MetadataService.Report> changesNeedToSave = new List<MetadataService.Report>();
		for(MetadataService.Metadata rem : reportMetadata) {
			MetadataService.Report re = (MetadataService.Report)rem;
			System.debug(re.fullName);
			String reportName = getReportDeveloperNameFromPath(re.fullName);
			System.debug(reportName);
			System.debug('Before ' + re.fullName);
			if(String.isNotBlank(reportName) && reportNameToNewFolder.containsKey(reportName)) {
				re.fullName = reportNameToNewFolder.get(reportName) + '/' + reportName;
				System.debug('After  ' + re.fullName);
				changesNeedToSave.add(re);
			} 
		}
		if(!changesNeedToSave.isEmpty()) {
			handleSaveResults(service.updateMetadata(changesNeedToSave));
		}
	}

	public MetadataService.MetadataPort createService() {
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
        service.SessionHeader = new MetadataService.SessionHeader_element();
        service.SessionHeader.sessionId = UserInfo.getSessionId();
        return service;
    }

	public void handleSaveResults(MetadataService.SaveResult[] saveResult) {
    
	}

	public static String getReportDeveloperNameFromPath(String reportPath) {
		Integer lastIndexOf = reportPath.lastIndexOf('/');
		return reportPath.substring(lastIndexOf + 1, reportPath.length());
	}
}