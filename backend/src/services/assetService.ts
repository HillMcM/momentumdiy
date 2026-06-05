import { supabase } from '../config/supabase';
import crypto from 'crypto';
import { 
  Asset, 
  CreateAssetRequest, 
  UpdateAssetRequest, 
  ApiResponse,
  DatabaseAsset 
} from '../types';

export class AssetService {
  /**
   * Get all assets with optional filtering
   */
  static async getAssets(category?: string, search?: string): Promise<ApiResponse<Asset[]>> {
    try {
      let query = supabase
        .from('assets')
        .select('*')
        .order('upload_date', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const assets: Asset[] = (data as DatabaseAsset[]).map(this.mapDatabaseAssetToAsset);

      return {
        success: true,
        data: assets
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a single asset by ID
   */
  static async getAssetById(id: string): Promise<ApiResponse<Asset>> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Asset not found'
        };
      }

      const asset = this.mapDatabaseAssetToAsset(data as DatabaseAsset);

      return {
        success: true,
        data: asset
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new asset
   */
  static async createAsset(assetData: CreateAssetRequest): Promise<ApiResponse<Asset>> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([{
          name: assetData.name,
          description: assetData.description || '',
          category: assetData.category,
          file_type: assetData.fileType,
          file_size: assetData.fileSize,
          url: assetData.url,
          tags: assetData.tags || [],
          is_public: assetData.isPublic || false
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const asset = this.mapDatabaseAssetToAsset(data as DatabaseAsset);

      return {
        success: true,
        data: asset,
        message: 'Asset created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing asset
   */
  static async updateAsset(id: string, updates: UpdateAssetRequest): Promise<ApiResponse<Asset>> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.fileType !== undefined) updateData.file_type = updates.fileType;
      if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
      if (updates.url !== undefined) updateData.url = updates.url;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

      const { data, error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Asset not found'
        };
      }

      const asset = this.mapDatabaseAssetToAsset(data as DatabaseAsset);

      return {
        success: true,
        data: asset,
        message: 'Asset updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete an asset
   */
  static async deleteAsset(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Asset deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get assets by category
   */
  static async getAssetsByCategory(category: string): Promise<ApiResponse<Asset[]>> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('category', category)
        .order('upload_date', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const assets: Asset[] = (data as DatabaseAsset[]).map(this.mapDatabaseAssetToAsset);

      return {
        success: true,
        data: assets
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Search assets by name or description
   */
  static async searchAssets(searchTerm: string): Promise<ApiResponse<Asset[]>> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('upload_date', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const assets: Asset[] = (data as DatabaseAsset[]).map(this.mapDatabaseAssetToAsset);

      return {
        success: true,
        data: assets
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new asset share link
   */
  static async createShareLink(
    userId: string,
    data: { name: string; email?: string; expiresAt?: string; sharedAssetIds?: string[] }
  ): Promise<ApiResponse<any>> {
    try {
      const accessCode = 'sh_' + crypto.randomBytes(8).toString('hex');
      
      const { data: inserted, error } = await supabase
        .from('asset_share_links')
        .insert([{
          user_id: userId,
          name: data.name,
          email: data.email || null,
          expires_at: data.expiresAt || null,
          shared_asset_ids: data.sharedAssetIds || null,
          access_code: accessCode,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: inserted,
        message: 'Share link created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all share links for a user
   */
  static async getShareLinks(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('asset_share_links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update a share link
   */
  static async updateShareLink(
    userId: string,
    linkId: string,
    updates: { is_active?: boolean; name?: string; email?: string; expires_at?: string; shared_asset_ids?: string[] | null }
  ): Promise<ApiResponse<any>> {
    try {
      // First verify ownership
      const { data: existing, error: checkError } = await supabase
        .from('asset_share_links')
        .select('id')
        .eq('id', linkId)
        .eq('user_id', userId)
        .single();

      if (checkError || !existing) {
        return {
          success: false,
          error: 'Share link not found or unauthorized'
        };
      }

      const { data, error } = await supabase
        .from('asset_share_links')
        .update(updates)
        .eq('id', linkId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data,
        message: 'Share link updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a share link
   */
  static async deleteShareLink(userId: string, linkId: string): Promise<ApiResponse<void>> {
    try {
      // First verify ownership
      const { data: existing, error: checkError } = await supabase
        .from('asset_share_links')
        .select('id')
        .eq('id', linkId)
        .eq('user_id', userId)
        .single();

      if (checkError || !existing) {
        return {
          success: false,
          error: 'Share link not found or unauthorized'
        };
      }

      const { error } = await supabase
        .from('asset_share_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Share link deleted/revoked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetch assets shared via a public access code
   */
  static async getSharedAssets(accessCode: string): Promise<ApiResponse<{ shareInfo: any; assets: Asset[] }>> {
    try {
      const { data: shareLink, error: shareError } = await supabase
        .from('asset_share_links')
        .select('*')
        .eq('access_code', accessCode)
        .single();

      if (shareError || !shareLink) {
        return {
          success: false,
          error: 'Shared link not found or invalid'
        };
      }

      if (!shareLink.is_active) {
        return {
          success: false,
          error: 'This share link has been deactivated'
        };
      }

      if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
        return {
          success: false,
          error: 'This share link has expired'
        };
      }

      // Fetch assets
      let query = supabase.from('assets').select('*');
      
      // If shared_asset_ids is specific, filter by it
      if (shareLink.shared_asset_ids && shareLink.shared_asset_ids.length > 0) {
        query = query.in('id', shareLink.shared_asset_ids);
      }

      const { data: dbAssets, error: assetsError } = await query;

      if (assetsError) {
        return {
          success: false,
          error: assetsError.message
        };
      }

      const assets: Asset[] = (dbAssets || []).map(this.mapDatabaseAssetToAsset);

      return {
        success: true,
        data: {
          shareInfo: {
            name: shareLink.name,
            expiresAt: shareLink.expires_at,
            createdAt: shareLink.created_at
          },
          assets
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Map database asset to frontend asset format
   */
  private static mapDatabaseAssetToAsset(dbAsset: DatabaseAsset): Asset {
    return {
      id: dbAsset.id,
      name: dbAsset.name,
      description: dbAsset.description || '',
      category: dbAsset.category,
      fileType: dbAsset.file_type,
      fileSize: dbAsset.file_size,
      uploadDate: new Date(dbAsset.upload_date),
      url: dbAsset.url,
      tags: dbAsset.tags || [],
      isPublic: dbAsset.is_public
    };
  }
} 