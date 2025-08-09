import { Asset, CreateAssetRequest, UpdateAssetRequest, ApiResponse } from '../types';
export declare class AssetService {
    static getAssets(category?: string, search?: string): Promise<ApiResponse<Asset[]>>;
    static getAssetById(id: string): Promise<ApiResponse<Asset>>;
    static createAsset(assetData: CreateAssetRequest): Promise<ApiResponse<Asset>>;
    static updateAsset(id: string, updates: UpdateAssetRequest): Promise<ApiResponse<Asset>>;
    static deleteAsset(id: string): Promise<ApiResponse<void>>;
    static getAssetsByCategory(category: string): Promise<ApiResponse<Asset[]>>;
    static searchAssets(searchTerm: string): Promise<ApiResponse<Asset[]>>;
    private static mapDatabaseAssetToAsset;
}
//# sourceMappingURL=assetService.d.ts.map