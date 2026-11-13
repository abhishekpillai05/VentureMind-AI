import api from './api';

export const reportService = {
  // Get report section completion summary
  async getSummary(startupId) {
    const response = await api.get(`/reports/${startupId}/summary`);
    return response.data;
  },

  // Download PDF report as blob and trigger browser download
  async downloadPdf(startupId, startupName = 'Startup') {
    const response = await api.get(`/reports/${startupId}/pdf`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${startupName.replace(/[^a-zA-Z0-9_-]/g, '_')}_VentureMind_Report.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default reportService;
