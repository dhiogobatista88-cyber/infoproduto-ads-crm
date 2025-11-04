/**
 * Meta Marketing API Integration
 * Handles all interactions with Facebook/Instagram Ads API
 */

const META_API_VERSION = 'v24.0';
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export class MetaApiClient {
  constructor(private accessToken: string) {}

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    data?: Record<string, any>
  ): Promise<T> {
    const url = new URL(`${META_API_BASE_URL}${endpoint}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET' && data) {
      Object.entries(data).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
      url.searchParams.append('access_token', this.accessToken);
    } else {
      if (method === 'POST' || method === 'DELETE') {
        options.body = JSON.stringify({
          ...data,
          access_token: this.accessToken,
        });
      }
    }

    try {
      const response = await fetch(url.toString(), options);
      const result = await response.json();

      if (!response.ok) {
        const error = result as MetaApiError;
        throw new Error(
          `Meta API Error: ${error.error.message} (Code: ${error.error.code})`
        );
      }

      return result as T;
    } catch (error) {
      console.error('[Meta API] Request failed:', error);
      throw error;
    }
  }

  // ===== Campaign Operations =====

  async createCampaign(params: {
    adAccountId: string;
    name: string;
    objective: string;
    status?: 'ACTIVE' | 'PAUSED';
  }): Promise<{ id: string }> {
    return this.makeRequest(`/act_${params.adAccountId}/campaigns`, 'POST', {
      name: params.name,
      objective: params.objective,
      status: params.status || 'PAUSED',
      special_ad_categories: [],
    });
  }

  async updateCampaign(
    campaignId: string,
    data: {
      name?: string;
      status?: 'ACTIVE' | 'PAUSED';
    }
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/${campaignId}`, 'POST', data);
  }

  async deleteCampaign(campaignId: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/${campaignId}`, 'POST', {
      status: 'DELETED',
    });
  }

  async getCampaign(campaignId: string): Promise<{
    id: string;
    name: string;
    objective: string;
    status: string;
  }> {
    return this.makeRequest(`/${campaignId}`, 'GET', {
      fields: 'id,name,objective,status',
    });
  }

  // ===== Ad Set Operations =====

  async createAdSet(params: {
    campaignId: string;
    name: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    targeting: Record<string, any>;
    billingEvent?: string;
    optimizationGoal?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<{ id: string }> {
    const data: Record<string, any> = {
      campaign_id: params.campaignId,
      name: params.name,
      targeting: JSON.stringify(params.targeting),
      billing_event: params.billingEvent || 'IMPRESSIONS',
      optimization_goal: params.optimizationGoal || 'REACH',
      status: 'PAUSED',
    };

    if (params.dailyBudget) {
      data.daily_budget = params.dailyBudget;
    }
    if (params.lifetimeBudget) {
      data.lifetime_budget = params.lifetimeBudget;
    }
    if (params.startTime) {
      data.start_time = params.startTime;
    }
    if (params.endTime) {
      data.end_time = params.endTime;
    }

    return this.makeRequest(`/act_${params.campaignId}/adsets`, 'POST', data);
  }

  async updateAdSet(
    adSetId: string,
    data: {
      name?: string;
      status?: 'ACTIVE' | 'PAUSED';
      dailyBudget?: number;
      lifetimeBudget?: number;
    }
  ): Promise<{ success: boolean }> {
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name;
    if (data.status) updateData.status = data.status;
    if (data.dailyBudget) updateData.daily_budget = data.dailyBudget;
    if (data.lifetimeBudget) updateData.lifetime_budget = data.lifetimeBudget;

    return this.makeRequest(`/${adSetId}`, 'POST', updateData);
  }

  async deleteAdSet(adSetId: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/${adSetId}`, 'POST', {
      status: 'DELETED',
    });
  }

  // ===== Ad Creative Operations =====

  async createAdCreative(params: {
    adAccountId: string;
    name: string;
    objectStorySpec?: {
      page_id: string;
      link_data: {
        link: string;
        message: string;
        name?: string;
        description?: string;
        call_to_action?: {
          type: string;
          value: {
            link: string;
          };
        };
        image_hash?: string;
        video_id?: string;
      };
    };
  }): Promise<{ id: string }> {
    return this.makeRequest(`/act_${params.adAccountId}/adcreatives`, 'POST', {
      name: params.name,
      object_story_spec: params.objectStorySpec,
    });
  }

  async uploadImage(params: {
    adAccountId: string;
    imageUrl: string;
    filename: string;
  }): Promise<{ hash: string }> {
    const formData = new FormData();
    formData.append('url', params.imageUrl);
    formData.append('access_token', this.accessToken);

    const response = await fetch(
      `${META_API_BASE_URL}/act_${params.adAccountId}/adimages`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${result.error?.message}`);
    }

    return result.images[params.filename];
  }

  // ===== Ad Operations =====

  async createAd(params: {
    adSetId: string;
    name: string;
    creativeId: string;
    status?: 'ACTIVE' | 'PAUSED';
  }): Promise<{ id: string }> {
    return this.makeRequest(`/act_${params.adSetId}/ads`, 'POST', {
      name: params.name,
      adset_id: params.adSetId,
      creative: { creative_id: params.creativeId },
      status: params.status || 'PAUSED',
    });
  }

  async updateAd(
    adId: string,
    data: {
      name?: string;
      status?: 'ACTIVE' | 'PAUSED';
    }
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/${adId}`, 'POST', data);
  }

  async deleteAd(adId: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/${adId}`, 'POST', {
      status: 'DELETED',
    });
  }

  // ===== Insights Operations =====

  async getAdInsights(params: {
    adId: string;
    datePreset?: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'lifetime';
    fields?: string[];
  }): Promise<{
    data: Array<{
      impressions?: string;
      clicks?: string;
      spend?: string;
      reach?: string;
      ctr?: string;
      cpc?: string;
      actions?: Array<{ action_type: string; value: string }>;
    }>;
  }> {
    const fields = params.fields || [
      'impressions',
      'clicks',
      'spend',
      'reach',
      'ctr',
      'cpc',
      'actions',
    ];

    return this.makeRequest(`/${params.adId}/insights`, 'GET', {
      date_preset: params.datePreset || 'lifetime',
      fields: fields.join(','),
    });
  }

  async getCampaignInsights(params: {
    campaignId: string;
    datePreset?: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'lifetime';
  }): Promise<{
    data: Array<{
      impressions?: string;
      clicks?: string;
      spend?: string;
      reach?: string;
    }>;
  }> {
    return this.makeRequest(`/${params.campaignId}/insights`, 'GET', {
      date_preset: params.datePreset || 'lifetime',
      fields: 'impressions,clicks,spend,reach',
    });
  }

  // ===== Account Operations =====

  async getAdAccounts(): Promise<{
    data: Array<{
      id: string;
      account_id: string;
      name: string;
      account_status: number;
    }>;
  }> {
    return this.makeRequest('/me/adaccounts', 'GET', {
      fields: 'id,account_id,name,account_status',
    });
  }

  async getAdAccount(adAccountId: string): Promise<{
    id: string;
    account_id: string;
    name: string;
    currency: string;
    timezone_name: string;
  }> {
    return this.makeRequest(`/act_${adAccountId}`, 'GET', {
      fields: 'id,account_id,name,currency,timezone_name',
    });
  }
}

/**
 * Create a Meta API client instance with the given access token
 */
export function createMetaApiClient(accessToken: string): MetaApiClient {
  return new MetaApiClient(accessToken);
}
