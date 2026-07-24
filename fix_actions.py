import re

def process_file(filepath, missing_methods):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the export const blocks that call the missing methods and comment them out entirely.
    # It's easier to just replace the method call with `throw new Error("Not implemented");`
    # and add a type assertion to any parsedInput usage to avoid TS errors.
    
    for method in missing_methods:
        # Regex to find `await SalesService.methodName(...)` or `await DeliveryService.methodName(...)`
        # and replace the block inside `.action(async ({...}) => { ... })`
        pattern = r'(?P<start>\.action\(async\s*\([^)]*\)\s*=>\s*\{)(?P<body>.*?)(?P<call>await\s+(?:SalesService|DeliveryService)\.' + method + r'\s*\([^)]*\);?)(?P<rest>.*?)(?P<end>\})'
        
        def repl(m):
            return m.group('start') + '\n    throw new Error("Not implemented - ' + method + '");\n  }'
            
        content = re.sub(pattern, repl, content, flags=re.DOTALL)
        
        # If it wasn't caught by the regex (maybe it spans lines weirdly or returns implicitly)
        # Let's just do a simpler replace:
        content = re.sub(r'await\s+(?:SalesService|DeliveryService)\.' + method + r'\(.*?\);?', 'throw new Error("Not implemented - ' + method + '");', content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


missing_sales = [
    "createWebsiteLeadService", "updateWebsiteLeadService", "deleteWebsiteLeadService",
    "assignWebsiteLeadService", "batchCreateWebsiteLeadsService", "archiveDealService",
    "deleteDealService", "updateDealProbabilityService", "getDealActivityLogService",
    "addDealNoteService", "markDealAsLostService", "updateProposalContentService",
    "rejectProposalService", "generateProposalPdfService", "getProposalVersionsService"
]

missing_delivery = [
    "createProjectService", "updateProjectService", "archiveProjectService",
    "addProjectMemberService", "removeProjectMemberService", "addTaskCommentService",
    "updateTaskLabelsService", "addTaskAttachmentService", "deleteMilestoneService",
    "updateMilestoneDependenciesService", "updateDeliverableService", "deleteDeliverableService",
    "uploadDeliverableVersionService"
]

process_file('src/modules/sales/actions.ts', missing_sales)
process_file('src/modules/delivery/actions.ts', missing_delivery)

