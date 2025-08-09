export interface NotionSyncConfig {
    databaseId: string;
}
export declare class NotionSyncService {
    static syncMarketing(databaseId: string): Promise<{
        readonly success: true;
    }>;
    static syncContainer(containerIdOrUrl: string): Promise<{
        readonly success: true;
    }>;
    static syncGoalFromPage(goalTitle: string, pageIdOrUrl: string): Promise<{
        readonly success: true;
    }>;
    static debugPageBlocks(pageIdOrUrl: string): Promise<{
        readonly success: true;
        readonly blocks: {
            id: any;
            type: any;
            has_children: boolean;
            text: string;
        }[];
    }>;
    private static syncFromPageContainer;
    private static listBlockChildren;
    private static getPlainText;
    private static parseWeekHeading;
    private static syncModulesFromPage;
    private static syncModulesFromBlocks;
}
//# sourceMappingURL=notionSyncService.d.ts.map