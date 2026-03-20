import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { FaChartLine, FaTrophy, FaExclamationTriangle, FaCheckCircle, FaCalendarCheck, FaUsers, FaFire, FaChevronLeft, FaChevronRight, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [members, setMembers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    
    // Pagination State
    const [countryPage, setCountryPage] = useState(1);
    const [membersPage, setMembersPage] = useState(1);
    const [performersPage, setPerformersPage] = useState(1);
    const [needsAttentionPage, setNeedsAttentionPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAnalytics();
        fetchMembersAndReports();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/reports/analytics`, {
                headers: { 'x-auth-token': token },
                params: { range: timeRange }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembersAndReports = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch members (filtered by country for leaders)
            const membersRes = await axios.get(`${API_URL}/api/users`, {
                headers: { 'x-auth-token': token }
            });
            setMembers(membersRes.data);
            
            // Fetch all reports (filtered by country for leaders)
            const reportsRes = await axios.get(`${API_URL}/api/reports`, {
                headers: { 'x-auth-token': token }
            });
            setReports(reportsRes.data);
        } catch (error) {
            console.error('Error fetching members and reports:', error);
        }
    };

    const handleExport = async (type) => {
        try {
            const token = localStorage.getItem('token');
            
            // Calculate dates based on timeRange
            const endDate = new Date();
            let startDate = new Date();
            
            if (timeRange === 'week') {
                startDate.setDate(endDate.getDate() - 7);
            } else if (timeRange === 'month') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else if (timeRange === 'year') {
                startDate.setFullYear(endDate.getFullYear() - 1);
            }

            const params = {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            };

            const response = await axios.get(`${API_URL}/api/reports/export/${type}`, {
                headers: { 
                    'x-auth-token': token,
                    'Accept': type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                params: params,
                responseType: 'blob'
            });

            // Create blob with explicit MIME type
            const mimeType = type === 'pdf' 
                ? 'application/pdf' 
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const blob = new Blob([response.data], { type: mimeType });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with proper extension
            const extension = type === 'pdf' ? 'pdf' : 'xlsx';
            const filename = `ministry_analytics_${timeRange}.${extension}`;
            link.setAttribute('download', filename);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export analytics. Please try again.');
        }
    };

    const getPerformanceColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceBg = (percentage) => {
        if (percentage >= 90) return 'bg-green-50 border-green-200';
        if (percentage >= 70) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    // Pagination Helper
    const paginateData = (data, page) => {
        if (!data) return [];
        const start = (page - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };

    const renderPagination = (totalItems, currentPage, setPage) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center mt-4 gap-2">
                <button 
                    onClick={() => setPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                    <FaChevronLeft />
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => setPage(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Calculate member performance stats
    const getMemberStats = () => {
        const memberMap = new Map();
        
        members.forEach(member => {
            memberMap.set(member.id, {
                ...member,
                reportCount: 0,
                lastReportDate: null
            });
        });
        
        reports.forEach(report => {
            if (report.userId && memberMap.has(report.userId)) {
                const memberData = memberMap.get(report.userId);
                memberData.reportCount += 1;
                const reportDate = new Date(report.date);
                if (!memberData.lastReportDate || reportDate > memberData.lastReportDate) {
                    memberData.lastReportDate = reportDate;
                }
            }
        });
        
        return Array.from(memberMap.values());
    };
    
    const memberStats = getMemberStats();
    
    // Top performers (sorted by report count)
    const topPerformers = memberStats
        .filter(m => m.reportCount > 0)
        .sort((a, b) => b.reportCount - a.reportCount);
    
    // Needs attention (members with no reports or not reported in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const needsAttention = memberStats
        .filter(m => m.reportCount === 0 || !m.lastReportDate || m.lastReportDate < sevenDaysAgo)
        .sort((a, b) => {
            if (a.reportCount === 0 && b.reportCount > 0) return -1;
            if (a.reportCount > 0 && b.reportCount === 0) return 1;
            return (a.lastReportDate || new Date(0)) - (b.lastReportDate || new Date(0));
        });
    
    // Pagination for performers
    const performersIndexOfLast = performersPage * itemsPerPage;
    const performersIndexOfFirst = performersIndexOfLast - itemsPerPage;
    const performersTotalPages = Math.ceil(topPerformers.length / itemsPerPage);
    const currentPerformers = topPerformers.slice(performersIndexOfFirst, performersIndexOfLast);
    
    // Pagination for needs attention
    const needsAttentionIndexOfLast = needsAttentionPage * itemsPerPage;
    const needsAttentionIndexOfFirst = needsAttentionIndexOfLast - itemsPerPage;
    const needsAttentionTotalPages = Math.ceil(needsAttention.length / itemsPerPage);
    const currentNeedsAttention = needsAttention.slice(needsAttentionIndexOfFirst, needsAttentionIndexOfLast);

    const currentCountryStats = paginateData(analytics?.countryStats, countryPage);
    const currentAllStats = paginateData(analytics?.allStats, membersPage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
                                <FaChartLine />
                                Report Analytics
                            </h1>
                            <p className="text-gray-600 mt-2">Track member performance and reporting consistency</p>
                        </div>
                        {/* Time Range Selector */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setTimeRange('week')}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                    timeRange === 'week'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setTimeRange('month')}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                    timeRange === 'month'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setTimeRange('year')}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                    timeRange === 'year'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Year
                            </button>
                            
                            {/* Export Buttons */}
                            <button 
                                onClick={() => handleExport('pdf')}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                <FaFilePdf />
                                PDF
                            </button>
                            <button 
                                onClick={() => handleExport('excel')}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                <FaFileExcel />
                                Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                        <FaUsers className="text-3xl mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Total Members</p>
                        <p className="text-4xl font-bold">{analytics?.totalMembers || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                        <FaCalendarCheck className="text-3xl mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Total Reports</p>
                        <p className="text-4xl font-bold">{analytics?.totalReports || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white">
                        <FaChartLine className="text-3xl mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Evangelism Hours</p>
                        <p className="text-4xl font-bold">{analytics?.totalEvangelismHours || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                        <FaCheckCircle className="text-3xl mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Avg Completion</p>
                        <p className="text-4xl font-bold">{analytics?.averageCompletion || 0}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                        <FaFire className="text-3xl mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Top Streak</p>
                        <p className="text-4xl font-bold">{analytics?.topStreak || 0} days</p>
                    </div>
                </div>

                {/* Country Performance (Admin Only) */}
                {analytics?.countryStats && analytics.countryStats.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaTrophy className="text-indigo-500" />
                            Country Performance Ranking
                        </h2>
                        
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Completion</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentCountryStats.map((stat, index) => {
                                        const globalIndex = (countryPage - 1) * itemsPerPage + index;
                                        return (
                                        <tr key={stat.country}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    globalIndex === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    globalIndex === 1 ? 'bg-gray-100 text-gray-800' :
                                                    globalIndex === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-indigo-50 text-indigo-800'
                                                }`}>
                                                    #{globalIndex + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{stat.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    stat.averageCompletion >= 90 ? 'bg-green-100 text-green-800' :
                                                    stat.averageCompletion >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {stat.averageCompletion}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{stat.memberCount}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {currentCountryStats.map((stat, index) => {
                                const globalIndex = (countryPage - 1) * itemsPerPage + index;
                                return (
                                    <div key={stat.country} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    globalIndex === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    globalIndex === 1 ? 'bg-gray-100 text-gray-800' :
                                                    globalIndex === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-indigo-50 text-indigo-800'
                                                }`}>
                                                    #{globalIndex + 1}
                                                </div>
                                                <span className="font-bold text-gray-900">{stat.country}</span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                stat.averageCompletion >= 90 ? 'bg-green-100 text-green-800' :
                                                stat.averageCompletion >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {stat.averageCompletion}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 pl-11">
                                            {stat.memberCount} members
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {renderPagination(analytics.countryStats.length, countryPage, setCountryPage)}
                    </div>
                )}

                {/* Top Performers */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" />
                        Top Performers (Daily Reporting Champions)
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Members who consistently submit reports daily perform best!
                    </p>
                    <div className="space-y-3">
                        {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
                            analytics.topPerformers.map((member, index) => (
                                <div
                                    key={member.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${getPerformanceBg(
                                        member.completionRate
                                    )}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                                                index === 0
                                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                                    : index === 1
                                                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                                                    : index === 2
                                                    ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
                                                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white'
                                            }`}
                                        >
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{member.fullname}</p>
                                            <p className="text-sm text-gray-600">
                                                {member.reportsSubmitted} reports submitted • {member.currentStreak} day streak
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-3xl font-bold ${getPerformanceColor(member.completionRate)}`}>
                                            {member.completionRate}%
                                        </p>
                                        <p className="text-xs text-gray-600">completion</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No data available yet</p>
                        )}
                    </div>
                </div>

                {/* Members Needing Attention */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-500" />
                        Needs Attention (Missing Daily Reports)
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Members who missed reporting - encourage daily submission for better performance
                    </p>
                    <div className="space-y-3">
                        {analytics?.needsAttention && analytics.needsAttention.length > 0 ? (
                            analytics.needsAttention.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-red-50 border-2 border-red-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                            <FaExclamationTriangle className="text-red-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{member.fullname}</p>
                                            <p className="text-sm text-gray-600">
                                                Last report: {member.lastReportDate || 'Never'} • {member.missedDays} days missed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-red-600">{member.completionRate}%</p>
                                        <p className="text-xs text-gray-600">completion</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-green-50 rounded-xl border-2 border-green-200">
                                <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-2" />
                                <p className="text-green-800 font-semibold">All members are up to date!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* All Members Performance Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaUsers className="text-indigo-600" />
                        All Members Performance
                    </h2>
                    
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evangelism Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Report</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentAllStats.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.fullname}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                member.completionRate >= 90 ? 'bg-green-100 text-green-800' : 
                                                member.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {member.completionRate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.reportsSubmitted}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">{member.totalEvangelismHours || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.currentStreak} days</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.lastReportDate || 'Never'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {currentAllStats.map((member) => (
                            <div key={member.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{member.fullname}</h3>
                                        <p className="text-xs text-gray-500">Last: {member.lastReportDate || 'Never'}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        member.completionRate >= 90 ? 'bg-green-100 text-green-800' : 
                                        member.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {member.completionRate}%
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-xs text-gray-500">Reports</p>
                                        <p className="font-semibold">{member.reportsSubmitted}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-xs text-gray-500">Streak</p>
                                        <p className="font-semibold">{member.currentStreak} days</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100 col-span-2">
                                        <p className="text-xs text-gray-500">Evangelism Hours</p>
                                        <p className="font-bold text-indigo-600">{member.totalEvangelismHours || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {renderPagination(analytics?.allStats?.length || 0, membersPage, setMembersPage)}
                </div>

                {/* Top Performers Section */}
                {topPerformers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaTrophy className="text-yellow-600" />
                                Top Performers (Daily Reporting Champions)
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Members who consistently submit reports daily perform best!</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-yellow-100 to-amber-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Reports</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Report</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentPerformers.map((member, index) => (
                                        <tr key={member.id} className="hover:bg-yellow-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {performersIndexOfFirst + index + 1 === 1 && <span className="text-2xl">🥇</span>}
                                                    {performersIndexOfFirst + index + 1 === 2 && <span className="text-2xl">🥈</span>}
                                                    {performersIndexOfFirst + index + 1 === 3 && <span className="text-2xl">🥉</span>}
                                                    <span className="font-bold text-gray-700">#{performersIndexOfFirst + index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold">
                                                        {member.fullname.charAt(0)}
                                                    </div>
                                                    <div className="font-medium text-gray-900">{member.fullname}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                                                    {member.reportCount} reports
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {member.lastReportDate ? new Date(member.lastReportDate).toLocaleDateString() : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination for Top Performers */}
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-yellow-50">
                                <div className="text-sm text-gray-600">
                                    Showing {performersIndexOfFirst + 1} to {Math.min(performersIndexOfLast, topPerformers.length)} of {topPerformers.length} members
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPerformersPage(prev => Math.max(prev - 1, 1))}
                                        disabled={performersPage === 1}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                            performersPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        }`}
                                    >
                                        <FaChevronLeft className="text-xs" />
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium">
                                        {performersPage}
                                    </span>
                                    <button
                                        onClick={() => setPerformersPage(prev => Math.min(prev + 1, performersTotalPages))}
                                        disabled={performersPage === performersTotalPages}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                            performersPage === performersTotalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        }`}
                                    >
                                        Next
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            </div>
                    </div>
                )}

                {/* Needs Attention Section */}
                {needsAttention.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-600" />
                                Needs Attention (Missing Daily Reports)
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Members who missed reporting - encourage daily submission for better performance</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-red-100 to-orange-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Reports</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Report</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentNeedsAttention.map(member => (
                                        <tr key={member.id} className="hover:bg-red-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                                        {member.fullname.charAt(0)}
                                                    </div>
                                                    <div className="font-medium text-gray-900">{member.fullname}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                    member.reportCount === 0 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {member.reportCount} reports
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {member.lastReportDate ? new Date(member.lastReportDate).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    member.reportCount === 0
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {member.reportCount === 0 ? 'No Reports' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination for Needs Attention */}
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-red-50">
                                <div className="text-sm text-gray-600">
                                    Showing {needsAttentionIndexOfFirst + 1} to {Math.min(needsAttentionIndexOfLast, needsAttention.length)} of {needsAttention.length} members
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setNeedsAttentionPage(prev => Math.max(prev - 1, 1))}
                                        disabled={needsAttentionPage === 1}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                            needsAttentionPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                    >
                                        <FaChevronLeft className="text-xs" />
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium">
                                        {needsAttentionPage}
                                    </span>
                                    <button
                                        onClick={() => setNeedsAttentionPage(prev => Math.min(prev + 1, needsAttentionTotalPages))}
                                        disabled={needsAttentionPage === needsAttentionTotalPages}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                            needsAttentionPage === needsAttentionTotalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                    >
                                        Next
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            </div>
                    </div>
                )}

                {/* Performance Guide */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 mt-6 border-2 border-indigo-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-3">📊 Performance Rating Guide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                            <p className="font-bold text-green-800 mb-1">Excellent (90-100%)</p>
                            <p className="text-sm text-gray-700">Submits daily reports consistently</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                            <p className="font-bold text-yellow-800 mb-1">Good (70-89%)</p>
                            <p className="text-sm text-gray-700">Reports regularly with some gaps</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                            <p className="font-bold text-red-800 mb-1">Needs Improvement (&lt;70%)</p>
                            <p className="text-sm text-gray-700">Missing many daily reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
