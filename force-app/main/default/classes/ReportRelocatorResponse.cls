/**
* @File Name : ReportRelocatorResponse.cls
* @Description : Used to contains all wrapper class
* @Author : Nihal Singh
* @Last Modified By :
* @Last Modified On : February 13, 2025
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | February 13, 2025 | Nihal Singh | Initial Version
**/

public class ReportRelocatorResponse {
	
	public class FolderResponse {
		@AuraEnabled
		public Boolean isSuccess;
		@AuraEnabled
		public String message;
		@AuraEnabled
		public List<Folder> folders;

		public FolderResponse(Boolean isSuccess, String message, List<Folder> folders) {
			this.isSuccess = isSuccess;
			this.message = message;
			this.folders = folders;
		}
	}

	public class ReportResponse {
		@AuraEnabled
		public Boolean isSuccess;
		@AuraEnabled
		public String message;
		@AuraEnabled
		public List<Report> reports;

		public ReportResponse(Boolean isSuccess, String message, List<Report> reports) {
			this.isSuccess = isSuccess;
			this.message = message;
			this.reports = reports;
		}
	}

	public class Report {
		@AuraEnabled
		public String reportId;
		@AuraEnabled
		public String reportName;
		@AuraEnabled
		public String developerName;
		@AuraEnabled
		public Folder oldFolderName;
		@AuraEnabled
		public Folder newFolderName;

		public Report(String reportId, String reportName, String developerName, Folder oldFolderName) {
			this.reportId = reportId;
			this.reportName = reportName;
			this.developerName = developerName;
			this.oldFolderName = oldFolderName;
		}
	}

	public class Folder {
		@AuraEnabled
		public String folderId;
		@AuraEnabled
		public String displayName;
		@AuraEnabled
		public String developerName;

		public Folder(String folderId, String displayName, String developerName) {
			this.folderId = folderId;
			this.displayName = displayName;
			this.developerName = developerName;
		}
	}

	public class ReportScheduledJobResponse {
		@AuraEnabled
		public String reportLogId;
		@AuraEnabled
		public String reportLogName;
		@AuraEnabled
		public Boolean isSuccess;
		@AuraEnabled
		public String message;
	}
}