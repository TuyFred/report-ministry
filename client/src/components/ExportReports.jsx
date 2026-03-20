import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaFilePdf, FaFileExcel, FaCalendarAlt, FaDownload } from 'react-icons/fa';

const ExportReports = () => {
    const { user } = useContext(AuthContext);
    
    // All authenticated users can export their own reports
    if (!user) {
        return null;
    }

    const [filterType, setFilterType] = useState('today'); // today, week, month, custom, single
    const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [exporting, setExporting] = useState(false);

    const getDateRange = () => {
        const today = new Date();
        let start, end;

        switch (filterType) {
            case 'today':
                start = end = today.toISOString().split('T')[0];
                break;

            case 'week':
                // Current week (Sunday to Saturday)
                const curr = new Date(today);
                const first = curr.getDate() - curr.getDay(); // Sunday
                const last = first + 6; // Saturday
                start = new Date(curr.setDate(first)).toISOString().split('T')[0];
                end = new Date(curr.setDate(last)).toISOString().split('T')[0];
                break;

            case 'month':
                // Current month
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                break;

            case 'single':
                start = end = singleDate;
                break;

            case 'custom':
                start = startDate;
                end = endDate;
                break;

            default:
                start = end = today.toISOString().split('T')[0];
        }

        return { startDate: start, endDate: end };
    };

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const { startDate: start, endDate: end } = getDateRange();

            const params = {
                startDate: start,
                endDate: end,
                userId: user.id // Export only user's own reports
            };

            const response = await axios.get(`${API_URL}/api/reports/export/${format}`, {
                headers: { 
                    'x-auth-token': token,
                    'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                params: params,
                responseType: 'blob' // Important for file download
            });

            // Verify we got a proper blob response
            if (!response.data || response.data.size === 0) {
                throw new Error('Received empty file');
            }

            // Create blob with correct MIME type
            const blob = new Blob([response.data], {
                type: format === 'pdf' 
                    ? 'application/pdf' 
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with proper extension
            const dateStr = filterType === 'custom' 
                ? `${start}_to_${end}` 
                : filterType === 'single'
                ? start
                : filterType;
            const extension = format === 'pdf' ? 'pdf' : 'xlsx';
            const filename = `ministry_report_${dateStr}.${extension}`;
            
            link.setAttribute('download', filename);
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            alert(`${format.toUpperCase()} exported successfully!\\nFile: ${filename}`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <FaDownload className="text-white text-sm" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Export Reports</h2>
            </div>

            {/* Filter Type Selection */}
            <div className="mb-4">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Select Date Range
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    <button
                        onClick={() => setFilterType('today')}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                            filterType === 'today'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setFilterType('week')}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                            filterType === 'week'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => setFilterType('month')}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                            filterType === 'month'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setFilterType('single')}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                            filterType === 'single'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Single Date
                    </button>
                    <button
                        onClick={() => setFilterType('custom')}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                            filterType === 'custom'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Custom Range
                    </button>
                </div>
            </div>

            {/* Date Inputs */}
            {filterType === 'single' && (
                <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-1 text-xs" />
                        Select Date
                    </label>
                    <input
                        type="date"
                        value={singleDate}
                        onChange={(e) => setSingleDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                </div>
            )}

            {filterType === 'custom' && (
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Date Range Preview */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs sm:text-sm text-gray-700">
                    <strong className="text-indigo-900">Exporting: </strong>
                    {(() => {
                        const { startDate: start, endDate: end } = getDateRange();
                        if (start === end) {
                            return new Date(start).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                        }
                        return `${new Date(start).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })} - ${new Date(end).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}`;
                    })()}
                </p>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold text-sm hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaFilePdf className="text-base sm:text-lg" />
                    <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
                </button>
                <button
                    onClick={() => handleExport('excel')}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold text-sm hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaFileExcel className="text-base sm:text-lg" />
                    <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
                </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Note:</strong> The export will include all your submitted reports for the selected date range. 
                    PDF format is best for printing, while Excel format allows further data analysis.
                </p>
            </div>
        </div>
    );
};

export default ExportReports;
