/**
* @File Name : ReportRelocatorController.cls
* @Description : Used to contains all reaquired method that will be used on LWC
* @Author : Nihal Singh
* @Last Modified By :
* @Last Modified On : February 13, 2025
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | February 13, 2025 | Nihal Singh | Initial Version
**/
public class ReportRelocatorController {
    
    public static Boolean throwException = false; // Only for test class coverage

	@AuraEnabled
	public static ReportRelocatorResponse.FolderResponse getAllReportFolder(String likeName) {
		try {
            if(throwException == true) {
                throw new CustomException('Only for test coverage');
            }
			List<ReportRelocatorResponse.Folder> folders = new List<ReportRelocatorResponse.Folder>();
			if(String.isBlank(likeName)) {
				for(Folder fo : [SELECT Id, Name, DeveloperName FROM Folder WHERE Type = 'Report' AND NamespacePrefix = '' ORDER BY Name]) {
					if(String.isNotBlank(fo.Name)) 
						folders.add(new ReportRelocatorResponse.Folder(fo.Id, fo.Name, fo.DeveloperName));
				}
			}else {
				String pattern = '%' + likeName + '%';
				for(Folder fo : [SELECT Id, Name, DeveloperName FROM Folder WHERE Type = 'Report' AND Name LIKE :pattern AND NamespacePrefix = '' ORDER BY Name]) {
					if(String.isNotBlank(fo.Name)) 
						folders.add(new ReportRelocatorResponse.Folder(fo.Id, fo.Name, fo.DeveloperName));
				}
			}
			return new ReportRelocatorResponse.FolderResponse(true, null, folders);
		}catch(Exception ex) {
			return new ReportRelocatorResponse.FolderResponse(false, ex.getMessage(), null);
		}
	}

	@AuraEnabled
	public static ReportRelocatorResponse.ReportResponse getReportInFolder(List<String> folderIds, String mode, String likeName) {
		try {
            if(throwException == true) {
                throw new CustomException('Only for test coverage');
            }
			List<ReportRelocatorResponse.Report> reports = new List<ReportRelocatorResponse.Report>();
			if(mode == 'allReport' && String.isNotBlank(likeName)) {
				String pattern = '%' + likeName + '%';
				for(Report re : [SELECT Id, Name, DeveloperName, FolderName, OwnerId FROM Report WHERE FolderName != 'Private Reports' AND NamespacePrefix = '' AND Name LIKE :pattern ORDER BY Name LIMIT 200]) {
					reports.add(new ReportRelocatorResponse.Report(re.Id, re.Name, re.DeveloperName, new ReportRelocatorResponse.Folder(re.OwnerId, re.FolderName, null)));
				}
			}else if(mode == 'inFolder' && String.isNotBlank(likeName))  {
				String pattern = '%' + likeName + '%';
				for(Report re : [SELECT Id, Name, DeveloperName, FolderName, OwnerId FROM Report WHERE FolderName != 'Private Reports' AND NamespacePrefix = '' AND OwnerId IN : folderIds AND Name LIKE :pattern ORDER BY Name]) {
					reports.add(new ReportRelocatorResponse.Report(re.Id, re.Name, re.DeveloperName, new ReportRelocatorResponse.Folder(re.OwnerId, re.FolderName, null)));
				}
			}else if(mode == 'allReport') {
				for(Report re : [SELECT Id, Name, DeveloperName, FolderName, OwnerId FROM Report WHERE FolderName != 'Private Reports' AND NamespacePrefix = '' ORDER BY Name LIMIT 200]) {
					reports.add(new ReportRelocatorResponse.Report(re.Id, re.Name, re.DeveloperName, new ReportRelocatorResponse.Folder(re.OwnerId, re.FolderName, null)));
				}
			}else if(mode == 'inFolder') {
				for(Report re : [SELECT Id, Name, DeveloperName, FolderName, OwnerId FROM Report WHERE FolderName != 'Private Reports' AND NamespacePrefix = '' AND OwnerId IN : folderIds ORDER BY Name]) {
					reports.add(new ReportRelocatorResponse.Report(re.Id, re.Name, re.DeveloperName, new ReportRelocatorResponse.Folder(re.OwnerId, re.FolderName, null)));
				}
			}
			return new ReportRelocatorResponse.ReportResponse(true, null, reports);
		}catch(Exception ex) {
			return new ReportRelocatorResponse.ReportResponse(false, ex.getMessage(), null);
		}
	}

	@AuraEnabled
	public static ReportRelocatorResponse.ReportScheduledJobResponse moveSelectedReportToFolder(String stringifyReports) {
		ReportRelocatorResponse.ReportScheduledJobResponse res = new ReportRelocatorResponse.ReportScheduledJobResponse();
		try {
            if(throwException == true) {
                throw new CustomException('Only for test coverage');
            }
			String jobId = System.enqueueJob(new ReportRelocatorJob(stringifyReports));
			res.reportLogId = jobId;
			res.isSuccess = true;
			res.message = 'Job has been queued, please check the result below from jobId.';
		}catch(Exception ex) {
			res.isSuccess = true;
			res.message = ex.getMessage();
		}
		return res;
	}

	@AuraEnabled
	public static AsyncApexJob getJobStatus(String jobId) {
		try {
            if(throwException == true) {
                throw new CustomException('Only for test coverage');
            }
			List<AsyncApexJob> jobDetails = [SELECT Id, CreatedDate, Status, ExtendedStatus, JobType, CreatedBy.Name FROM AsyncApexJob WHERE Id =: jobId];
			return jobDetails.isEmpty() ? null : jobDetails[0];
		}catch(Exception ex) {
			throw new AuraHandledException(ex.getMessage());
		}
	}

	@AuraEnabled
	public static ReportRelocatorResponse.ReportResponse getUpdatedReportList(List<String> reportIds) {
		try {
            if(throwException == true) {
                throw new CustomException('Only for test coverage');
            }
			List<ReportRelocatorResponse.Report> reports = new List<ReportRelocatorResponse.Report>();
			for(Report re : [SELECT Id, Name, DeveloperName, FolderName, OwnerId FROM Report WHERE Id IN : reportIds]) {
				reports.add(new ReportRelocatorResponse.Report(re.Id, re.Name, re.DeveloperName, new ReportRelocatorResponse.Folder(re.OwnerId, re.FolderName, null)));
			}
			return new ReportRelocatorResponse.ReportResponse(true, null, reports);
		}catch(Exception ex) {
			return new ReportRelocatorResponse.ReportResponse(false, ex.getMessage(), null);
		}
	}
    
    public class CustomException extends Exception {
        
    }
}