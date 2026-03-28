import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';

export interface UsageMetrics {
  date: string;
  reads: number;
  writes: number;
  deletes: number;
  storageBytes: number;
  bandwidthBytes: number;
  estimatedCost: number;
}

export interface CostAlert {
  id: string;
  type: 'threshold' | 'spike' | 'quota';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: UsageMetrics;
  createdAt: Timestamp;
  acknowledged: boolean;
}

const PRICING = {
  READ_PER_100K: 0.36,
  WRITE_PER_100K: 1.08,
  DELETE_PER_100K: 0.036,
  STORAGE_PER_GB: 0.18,
  BANDWIDTH_PER_GB: 0.12,
};

const THRESHOLDS = {
  DAILY_READS: 500000,
  DAILY_WRITES: 200000,
  DAILY_COST: 50,
  STORAGE_GB: 10,
};

export const costMonitoringService = {
  async recordUsage(metrics: Omit<UsageMetrics, 'estimatedCost'>): Promise<void> {
    console.log('[CostMonitoring] Recording usage metrics:', metrics);
    
    try {
      const estimatedCost = this.calculateCost(metrics);
      
      await addDoc(collection(getDbInstance(), 'usage_metrics'), {
        ...metrics,
        estimatedCost,
        createdAt: serverTimestamp(),
      });
      
      await this.checkThresholds({ ...metrics, estimatedCost });
      
      console.log('[CostMonitoring] Usage metrics recorded');
    } catch (error) {
      console.error('[CostMonitoring] Error recording usage:', error);
    }
  },

  calculateCost(metrics: Omit<UsageMetrics, 'estimatedCost'>): number {
    const readCost = (metrics.reads / 100000) * PRICING.READ_PER_100K;
    const writeCost = (metrics.writes / 100000) * PRICING.WRITE_PER_100K;
    const deleteCost = (metrics.deletes / 100000) * PRICING.DELETE_PER_100K;
    const storageCost = (metrics.storageBytes / (1024 * 1024 * 1024)) * PRICING.STORAGE_PER_GB;
    const bandwidthCost = (metrics.bandwidthBytes / (1024 * 1024 * 1024)) * PRICING.BANDWIDTH_PER_GB;
    
    return readCost + writeCost + deleteCost + storageCost + bandwidthCost;
  },

  async checkThresholds(metrics: UsageMetrics): Promise<void> {
    const alerts: Omit<CostAlert, 'id' | 'createdAt'>[] = [];
    
    if (metrics.reads > THRESHOLDS.DAILY_READS) {
      alerts.push({
        type: 'threshold',
        severity: metrics.reads > THRESHOLDS.DAILY_READS * 1.5 ? 'high' : 'medium',
        message: `Daily read operations exceeded threshold: ${metrics.reads.toLocaleString()} reads`,
        metrics,
        acknowledged: false,
      });
    }
    
    if (metrics.writes > THRESHOLDS.DAILY_WRITES) {
      alerts.push({
        type: 'threshold',
        severity: metrics.writes > THRESHOLDS.DAILY_WRITES * 1.5 ? 'high' : 'medium',
        message: `Daily write operations exceeded threshold: ${metrics.writes.toLocaleString()} writes`,
        metrics,
        acknowledged: false,
      });
    }
    
    if (metrics.estimatedCost > THRESHOLDS.DAILY_COST) {
      alerts.push({
        type: 'threshold',
        severity: metrics.estimatedCost > THRESHOLDS.DAILY_COST * 2 ? 'critical' : 'high',
        message: `Daily cost exceeded threshold: $${metrics.estimatedCost.toFixed(2)}`,
        metrics,
        acknowledged: false,
      });
    }
    
    const storageGB = metrics.storageBytes / (1024 * 1024 * 1024);
    if (storageGB > THRESHOLDS.STORAGE_GB) {
      alerts.push({
        type: 'quota',
        severity: storageGB > THRESHOLDS.STORAGE_GB * 1.5 ? 'critical' : 'high',
        message: `Storage usage exceeded threshold: ${storageGB.toFixed(2)} GB`,
        metrics,
        acknowledged: false,
      });
    }
    
    for (const alert of alerts) {
      await addDoc(collection(getDbInstance(), 'cost_alerts'), {
        ...alert,
        createdAt: serverTimestamp(),
      });
      
      console.warn('[CostMonitoring] Alert created:', alert.message);
    }
  },

  async getUsageMetrics(days: number = 30): Promise<UsageMetrics[]> {
    console.log('[CostMonitoring] Fetching usage metrics for last', days, 'days');
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const metricsQuery = query(
        collection(getDbInstance(), 'usage_metrics'),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        orderBy('date', 'desc'),
        limit(days)
      );
      
      const metricsSnapshot = await getDocs(metricsQuery);
      
      const metrics: UsageMetrics[] = [];
      metricsSnapshot.forEach((doc) => {
        metrics.push(doc.data() as UsageMetrics);
      });
      
      return metrics;
    } catch (error) {
      console.error('[CostMonitoring] Error fetching usage metrics:', error);
      return [];
    }
  },

  async getAlerts(acknowledged: boolean = false): Promise<CostAlert[]> {
    console.log('[CostMonitoring] Fetching alerts, acknowledged:', acknowledged);
    
    try {
      const alertsQuery = query(
        collection(getDbInstance(), 'cost_alerts'),
        where('acknowledged', '==', acknowledged),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      
      const alerts: CostAlert[] = [];
      alertsSnapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data(),
        } as CostAlert);
      });
      
      return alerts;
    } catch (error) {
      console.error('[CostMonitoring] Error fetching alerts:', error);
      return [];
    }
  },

  async getTotalCost(days: number = 30): Promise<number> {
    const metrics = await this.getUsageMetrics(days);
    return metrics.reduce((total, metric) => total + metric.estimatedCost, 0);
  },

  async getMonthlyReport(): Promise<{
    totalCost: number;
    totalReads: number;
    totalWrites: number;
    totalDeletes: number;
    averageDailyCost: number;
    projectedMonthlyCost: number;
    alerts: CostAlert[];
  }> {
    console.log('[CostMonitoring] Generating monthly report');
    
    try {
      const metrics = await this.getUsageMetrics(30);
      const alerts = await this.getAlerts(false);
      
      const totalCost = metrics.reduce((sum, m) => sum + m.estimatedCost, 0);
      const totalReads = metrics.reduce((sum, m) => sum + m.reads, 0);
      const totalWrites = metrics.reduce((sum, m) => sum + m.writes, 0);
      const totalDeletes = metrics.reduce((sum, m) => sum + m.deletes, 0);
      
      const averageDailyCost = totalCost / Math.max(metrics.length, 1);
      const projectedMonthlyCost = averageDailyCost * 30;
      
      return {
        totalCost,
        totalReads,
        totalWrites,
        totalDeletes,
        averageDailyCost,
        projectedMonthlyCost,
        alerts,
      };
    } catch (error) {
      console.error('[CostMonitoring] Error generating monthly report:', error);
      throw error;
    }
  },

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  },

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  },
};
