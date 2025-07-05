import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = __DEV__;

  // Start timing a metric
  startMetric(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  // End timing a metric
  endMetric(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`PerformanceMonitor: Metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations in development
    if (metric.duration > 100) {
      console.warn(`🐌 Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  // Measure a function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMetric(name, metadata);
    try {
      const result = await fn();
      this.endMetric(name);
      return result;
    } catch (error) {
      this.endMetric(name);
      throw error;
    }
  }

  // Measure a synchronous function execution time
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMetric(name, metadata);
    try {
      const result = fn();
      this.endMetric(name);
      return result;
    } catch (error) {
      this.endMetric(name);
      throw error;
    }
  }

  // Get a specific metric
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Generate a performance report
  generateReport(): PerformanceReport {
    const metrics = this.getAllMetrics().filter(m => m.duration !== undefined);
    
    if (metrics.length === 0) {
      return {
        metrics: [],
        summary: {
          totalMetrics: 0,
          averageDuration: 0,
          slowestMetric: null,
          fastestMetric: null,
        },
      };
    }

    const durations = metrics.map(m => m.duration!);
    const averageDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    
    const slowestMetric = metrics.reduce((slowest, current) => 
      current.duration! > slowest.duration! ? current : slowest
    );
    
    const fastestMetric = metrics.reduce((fastest, current) => 
      current.duration! < fastest.duration! ? current : fastest
    );

    return {
      metrics,
      summary: {
        totalMetrics: metrics.length,
        averageDuration,
        slowestMetric,
        fastestMetric,
      },
    };
  }

  // Print performance report to console
  printReport(): void {
    if (!this.isEnabled) return;

    const report = this.generateReport();
    
    console.group('📊 Performance Report');
    console.log(`Total Metrics: ${report.summary.totalMetrics}`);
    console.log(`Average Duration: ${report.summary.averageDuration.toFixed(2)}ms`);
    
    if (report.summary.slowestMetric) {
      console.log(`Slowest: ${report.summary.slowestMetric.name} (${report.summary.slowestMetric.duration!.toFixed(2)}ms)`);
    }
    
    if (report.summary.fastestMetric) {
      console.log(`Fastest: ${report.summary.fastestMetric.name} (${report.summary.fastestMetric.duration!.toFixed(2)}ms)`);
    }

    // Log all metrics
    console.group('All Metrics:');
    report.metrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.duration!.toFixed(2)}ms`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }

  // Enable/disable performance monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if monitoring is enabled
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for measuring component render time
export const usePerformanceMonitor = () => {
  const startRender = (componentName: string) => {
    performanceMonitor.startMetric(`${componentName}_render`);
  };

  const endRender = (componentName: string) => {
    performanceMonitor.endMetric(`${componentName}_render`);
  };

  return { startRender, endRender };
}; 