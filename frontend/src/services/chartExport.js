// Chart export service for exporting charts as images
import { chartPreferences } from './chartPreferences';

class ChartExportService {
  constructor() {
    this.defaultOptions = {
      format: 'png',
      quality: 0.9,
      backgroundColor: '#ffffff',
      width: 800,
      height: 600,
      includeTitle: true,
      includeWatermark: false
    };
  }

  // Export chart as PNG
  async exportAsPNG(chartRef, filename = 'chart', options = {}) {
    const exportOptions = { ...this.defaultOptions, format: 'png', ...options };
    return this.exportChart(chartRef, filename, exportOptions);
  }

  // Export chart as SVG
  async exportAsSVG(chartRef, filename = 'chart', options = {}) {
    const exportOptions = { ...this.defaultOptions, format: 'svg', ...options };
    return this.exportChart(chartRef, filename, exportOptions);
  }

  // Main export function
  async exportChart(chartRef, filename, options) {
    try {
      if (!chartRef || !chartRef.current) {
        throw new Error('Chart reference is not available');
      }

      const chart = chartRef.current;
      const canvas = chart.canvas || chart.chartInstance?.canvas;
      
      if (!canvas) {
        throw new Error('Chart canvas is not available');
      }

      // Get user preferences
      const exportPrefs = chartPreferences.getExportPreferences();
      const finalOptions = { ...options, ...exportPrefs };

      if (finalOptions.format === 'svg') {
        return this.exportAsSVGFromCanvas(canvas, filename, finalOptions);
      } else {
        return this.exportAsPNGFromCanvas(canvas, filename, finalOptions);
      }
    } catch (error) {
      console.error('Chart export failed:', error);
      throw error;
    }
  }

  // Export PNG from canvas
  exportAsPNGFromCanvas(canvas, filename, options) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new canvas with custom dimensions if specified
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        
        exportCanvas.width = options.width || canvas.width;
        exportCanvas.height = options.height || canvas.height;

        // Fill background
        ctx.fillStyle = options.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw the chart
        ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

        // Add title if requested
        if (options.includeTitle && options.title) {
          this.addTitle(ctx, options.title, exportCanvas.width);
        }

        // Add watermark if requested
        if (options.includeWatermark) {
          this.addWatermark(ctx, exportCanvas.width, exportCanvas.height);
        }

        // Convert to blob and download
        exportCanvas.toBlob((blob) => {
          if (blob) {
            this.downloadBlob(blob, `${filename}.png`);
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png', options.quality);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Export SVG from canvas (convert to SVG)
  exportAsSVGFromCanvas(canvas, filename, options) {
    return new Promise((resolve, reject) => {
      try {
        const width = options.width || canvas.width;
        const height = options.height || canvas.height;

        // Create SVG string
        let svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="100%" height="100%" fill="${options.backgroundColor || '#ffffff'}"/>`;

        // Convert canvas to data URL and embed in SVG
        const dataURL = canvas.toDataURL('image/png');
        svgString += `
  <image x="0" y="0" width="${width}" height="${height}" xlink:href="${dataURL}"/>`;

        // Add title if requested
        if (options.includeTitle && options.title) {
          svgString += `
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">${options.title}</text>`;
        }

        // Add watermark if requested
        if (options.includeWatermark) {
          svgString += `
  <text x="${width - 10}" y="${height - 10}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#999" opacity="0.7">BudgetWise</text>`;
        }

        svgString += '\n</svg>';

        // Create blob and download
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        this.downloadBlob(blob, `${filename}.svg`);
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Add title to canvas
  addTitle(ctx, title, canvasWidth) {
    ctx.save();
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvasWidth / 2, 30);
    ctx.restore();
  }

  // Add watermark to canvas
  addWatermark(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = 'rgba(153, 153, 153, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('BudgetWise', canvasWidth - 10, canvasHeight - 10);
    ctx.restore();
  }

  // Download blob as file
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Batch export multiple charts
  async exportMultipleCharts(charts, options = {}) {
    const results = [];
    
    for (const chart of charts) {
      try {
        const result = await this.exportChart(
          chart.ref, 
          chart.filename || 'chart', 
          { ...options, title: chart.title }
        );
        results.push({ success: true, filename: chart.filename, result });
      } catch (error) {
        results.push({ success: false, filename: chart.filename, error: error.message });
      }
    }
    
    return results;
  }

  // Create shareable link (base64 data URL)
  async createShareableLink(chartRef, options = {}) {
    try {
      if (!chartRef || !chartRef.current) {
        throw new Error('Chart reference is not available');
      }

      const canvas = chartRef.current.canvas || chartRef.current.chartInstance?.canvas;
      if (!canvas) {
        throw new Error('Chart canvas is not available');
      }

      // Create export canvas
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      
      exportCanvas.width = options.width || 800;
      exportCanvas.height = options.height || 600;

      // Fill background
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Draw the chart
      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

      // Add title and watermark
      if (options.title) {
        this.addTitle(ctx, options.title, exportCanvas.width);
      }
      this.addWatermark(ctx, exportCanvas.width, exportCanvas.height);

      // Return data URL
      return exportCanvas.toDataURL('image/png', options.quality || 0.9);
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      throw error;
    }
  }

  // Copy chart to clipboard
  async copyToClipboard(chartRef, options = {}) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API not supported');
      }

      const canvas = chartRef.current.canvas || chartRef.current.chartInstance?.canvas;
      if (!canvas) {
        throw new Error('Chart canvas is not available');
      }

      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', options.quality || 0.9);
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const chartExport = new ChartExportService();
export default chartExport;