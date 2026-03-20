import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaFilePdf, FaFileExcel, FaChevronLeft, FaChevronRight, FaUsers, FaClock, FaBook, FaPray, FaChurch, FaHeart, FaChartLine } from 'react-icons/fa';

const MonthlyReport = () => {
    const { user } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [monthDates, setMonthDates] = useState({ start: '', end: '', month: '', year: '' });
    const parseTime = (timeValue) => {
        if (!timeValue) return 0;
        if (typeof timeValue === 'number') return timeValue;
        const parsed = parseFloat(timeValue);
        if (isNaN(parsed)) return 0;
        return parsed;
    };
    const [summary, setSummary] = useState({
        totalReports: 0,
        totalEvangelismHours: 0,
        totalPeopleReached: 0,
        totalContacts: 0,
        totalBibleStudySessions: 0,
        totalBibleStudyAttendants: 0,
        totalUniqueAttendants: 0,
        totalNewcomers: 0,
        totalMeditationTime: 0,
        totalPrayerTime: 0,
        totalExerciseTime: 0,
        totalArticles: 0,
        totalSermons: 0,
        morningServiceAttendance: 0,
        regularServiceAttendance: 0,
        avgEvangelismPerDay: 0,
        avgPeopleReachedPerDay: 0,
        completionRate: 0,
        weeklyBreakdown: []
    });

    useEffect(() => {
        calculateMonthDates();
    }, [selectedDate]);

    useEffect(() => {
        if (monthDates.start && monthDates.end) {
            fetchMonthlyReports();
        }
    }, [monthDates]);

    const calculateMonthDates = () => {
        const date = new Date(selectedDate);
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        setMonthDates({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            month: startDate.toLocaleDateString('en-US', { month: 'long' }),
            year: startDate.getFullYear()
        });
    };

    const fetchMonthlyReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = { 
                startDate: monthDates.start, 
                endDate: monthDates.end,
                userId: user.id
            };

            const response = await axios.get(`${API_URL}/api/reports`, {
                headers: { 'x-auth-token': token },
                params: params
            });

            const monthReports = response.data;
            setReports(monthReports);
            calculateSummary(monthReports);
        } catch (error) {
            console.error('Error fetching monthly reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (reportsList) => {
        const totalReports = reportsList.length;
        const daysInMonth = new Date(monthDates.year, new Date(monthDates.start).getMonth() + 1, 0).getDate();

        const totals = reportsList.reduce((acc, report) => {
            return {
                totalEvangelismHours: acc.totalEvangelismHours + parseTime(report.evangelism_hours),
                totalPeopleReached: acc.totalPeopleReached + (report.people_reached || 0),
                totalContacts: acc.totalContacts + (report.contacts_received || 0),
                totalBibleStudySessions: acc.totalBibleStudySessions + (report.bible_study_sessions || 0),
                totalBibleStudyAttendants: acc.totalBibleStudyAttendants + (report.bible_study_attendants || 0),
                totalUniqueAttendants: acc.totalUniqueAttendants + (report.unique_attendants || 0),
                totalNewcomers: acc.totalNewcomers + (report.newcomers || 0),
                totalMeditationTime: acc.totalMeditationTime + parseTime(report.meditation_time),
                totalPrayerTime: acc.totalPrayerTime + parseTime(report.prayer_time),
                totalExerciseTime: acc.totalExerciseTime + parseTime(report.exercise_time),
                totalArticles: acc.totalArticles + (report.articles_written || 0),
                totalSermons: acc.totalSermons + (report.sermons_listened || 0),
                morningServiceAttendance: acc.morningServiceAttendance + (report.morning_service && report.morning_service !== '' ? 1 : 0),
                regularServiceAttendance: acc.regularServiceAttendance + (report.regular_service && report.regular_service !== '' ? 1 : 0)
            };
        }, {
            totalEvangelismHours: 0,
            totalPeopleReached: 0,
            totalContacts: 0,
            totalBibleStudySessions: 0,
            totalBibleStudyAttendants: 0,
            totalUniqueAttendants: 0,
            totalNewcomers: 0,
            totalMeditationTime: 0,
            totalPrayerTime: 0,
            totalExerciseTime: 0,
            totalArticles: 0,
            totalSermons: 0,
            morningServiceAttendance: 0,
            regularServiceAttendance: 0
        });

        // Calculate weekly breakdown
        const weeklyBreakdown = calculateWeeklyBreakdown(reportsList);

        setSummary({
            totalReports,
            ...totals,
            avgEvangelismPerDay: totalReports > 0 ? (totals.totalEvangelismHours / totalReports).toFixed(2) : 0,
            avgPeopleReachedPerDay: totalReports > 0 ? (totals.totalPeopleReached / totalReports).toFixed(1) : 0,
            completionRate: ((totalReports / daysInMonth) * 100).toFixed(1),
            weeklyBreakdown
        });
    };

    const calculateWeeklyBreakdown = (reportsList) => {
        const weeks = {};
        
        reportsList.forEach(report => {
            const reportDate = new Date(report.date);
            const weekNum = getWeekOfMonth(reportDate);
            
            if (!weeks[weekNum]) {
                weeks[weekNum] = {
                    week: weekNum,
                    count: 0,
                    evangelismHours: 0,
                    peopleReached: 0
                };
            }
            
            weeks[weekNum].count++;
            weeks[weekNum].evangelismHours += parseTime(report.evangelism_hours);
            weeks[weekNum].peopleReached += (report.people_reached || 0);
        });
        
        return Object.values(weeks);
    };

    const getWeekOfMonth = (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfMonth = date.getDate();
        const weekNumber = Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
        return weekNumber;
    };

    const formatHours = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    const handlePreviousMonth = () => {
        const curr = new Date(selectedDate);
        curr.setMonth(curr.getMonth() - 1);
        setSelectedDate(curr.toISOString().split('T')[0]);
    };

    const handleNextMonth = () => {
        const curr = new Date(selectedDate);
        curr.setMonth(curr.getMonth() + 1);
        setSelectedDate(curr.toISOString().split('T')[0]);
    };

    const handleExport = async (type) => {
        try {
            const token = localStorage.getItem('token');
            const params = {
                startDate: monthDates.start,
                endDate: monthDates.end,
                userId: user.id
            };

            const response = await axios.get(`${API_URL}/api/reports/export/${type}`, {
                headers: { 
                    'x-auth-token': token,
                    'Accept': type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                params: params,
                responseType: 'blob'
            });

            // Verify response
            if (!response.data || response.data.size === 0) {
                throw new Error('Received empty file');
            }

            // Create blob with explicit MIME type
            const blob = new Blob([response.data], {
                type: type === 'pdf' 
                    ? 'application/pdf' 
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Proper filename with correct extension
            const extension = type === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `monthly_report_${monthDates.month}_${monthDates.year}.${extension}`);
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            alert(`Monthly report exported successfully as ${extension.toUpperCase()}!`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                                <FaCalendarAlt className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Monthly Report Summary</h1>
                                <p className="text-gray-600">{user?.fullname}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleExport('pdf')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                <FaFilePdf />
                                Export PDF
                            </button>
                            <button 
                                onClick={() => handleExport('excel')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                <FaFileExcel />
                                Export Excel
                            </button>
                        </div>
                    </div>

                    {/* Month Navigator */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button 
                            onClick={handlePreviousMonth}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-800">
                                {monthDates.month} {monthDates.year}
                            </p>
                            <p className="text-sm text-gray-600">
                                {new Date(monthDates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' - '}
                                {new Date(monthDates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <button 
                            onClick={handleNextMonth}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading monthly report...</p>
                    </div>
                ) : (
                    <>
                        {/* Completion Status */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Monthly Completion</h2>
                                <span className={`px-4 py-2 rounded-full font-bold ${
                                    summary.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                                    summary.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {summary.completionRate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                    className={`h-4 rounded-full transition-all ${
                                        summary.completionRate >= 90 ? 'bg-green-600' :
                                        summary.completionRate >= 70 ? 'bg-yellow-600' :
                                        'bg-red-600'
                                    }`}
                                    style={{ width: `${summary.completionRate}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {summary.totalReports} out of {new Date(monthDates.year, new Date(monthDates.start).getMonth() + 1, 0).getDate()} daily reports submitted this month
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Evangelism */}
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaUsers className="text-4xl opacity-80" />
                                    <FaChartLine className="text-2xl opacity-60" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{summary.totalPeopleReached}</h3>
                                <p className="text-blue-100 text-sm">People Reached</p>
                                <div className="mt-3 pt-3 border-t border-blue-400/30">
                                    <p className="text-xs text-blue-200">
                                        {formatHours(summary.totalEvangelismHours)} total
                                    </p>
                                    <p className="text-xs text-blue-200">
                                        Avg: {summary.avgPeopleReachedPerDay} per day
                                    </p>
                                </div>
                            </div>

                            {/* Bible Study */}
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaBook className="text-4xl opacity-80" />
                                    <span className="text-2xl font-bold opacity-80">{summary.totalBibleStudySessions}</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{summary.totalBibleStudyAttendants}</h3>
                                <p className="text-green-100 text-sm">Total Attendants</p>
                                <div className="mt-3 pt-3 border-t border-green-400/30">
                                    <p className="text-xs text-green-200">
                                        {summary.totalUniqueAttendants} unique people
                                    </p>
                                    <p className="text-xs text-green-200">
                                        {summary.totalNewcomers} newcomers
                                    </p>
                                </div>
                            </div>

                            {/* Prayer & Meditation */}
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaPray className="text-4xl opacity-80" />
                                    <FaClock className="text-2xl opacity-60" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{formatHours(summary.totalPrayerTime)}</h3>
                                <p className="text-purple-100 text-sm">Prayer Time</p>
                                <div className="mt-3 pt-3 border-t border-purple-400/30">
                                    <p className="text-xs text-purple-200">
                                        Meditation: {formatHours(summary.totalMeditationTime)}
                                    </p>
                                    <p className="text-xs text-purple-200">
                                        {summary.totalSermons} sermons listened
                                    </p>
                                </div>
                            </div>

                            {/* Service Attendance */}
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaChurch className="text-4xl opacity-80" />
                                    <FaHeart className="text-2xl opacity-60" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">
                                    {summary.morningServiceAttendance + summary.regularServiceAttendance}
                                </h3>
                                <p className="text-orange-100 text-sm">Service Attendance</p>
                                <div className="mt-3 pt-3 border-t border-orange-400/30">
                                    <p className="text-xs text-orange-200">
                                        {summary.morningServiceAttendance} morning services
                                    </p>
                                    <p className="text-xs text-orange-200">
                                        {summary.regularServiceAttendance} regular services
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Breakdown Chart */}
                        {summary.weeklyBreakdown.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Progress</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {summary.weeklyBreakdown.map((week, index) => (
                                        <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200">
                                            <h3 className="text-lg font-bold text-indigo-900 mb-3">Week {week.week}</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">Reports:</span>
                                                    <span className="font-bold text-indigo-900">{week.count}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">Evangelism:</span>
                                                    <span className="font-bold text-indigo-900">{formatHours(week.evangelismHours)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">Reached:</span>
                                                    <span className="font-bold text-indigo-900">{week.peopleReached}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detailed Statistics */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Statistics</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Ministry Activities */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                        <FaUsers className="text-indigo-600" />
                                        Ministry Activities
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Hours:</span>
                                            <span className="font-bold text-indigo-900">{formatHours(summary.totalEvangelismHours)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">People Reached:</span>
                                            <span className="font-bold text-indigo-900">{summary.totalPeopleReached}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Contacts:</span>
                                            <span className="font-bold text-indigo-900">{summary.totalContacts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Daily Avg:</span>
                                            <span className="font-bold text-indigo-900">{summary.avgEvangelismPerDay}h</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bible Study */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                                        <FaBook className="text-green-600" />
                                        Bible Study & Learning
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Sessions:</span>
                                            <span className="font-bold text-green-900">{summary.totalBibleStudySessions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Attendants:</span>
                                            <span className="font-bold text-green-900">{summary.totalBibleStudyAttendants}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Unique:</span>
                                            <span className="font-bold text-green-900">{summary.totalUniqueAttendants}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Newcomers:</span>
                                            <span className="font-bold text-green-900">{summary.totalNewcomers}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Spiritual Life */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                                        <FaPray className="text-purple-600" />
                                        Spiritual Life
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Prayer:</span>
                                            <span className="font-bold text-purple-900">{formatHours(summary.totalPrayerTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Meditation:</span>
                                            <span className="font-bold text-purple-900">{formatHours(summary.totalMeditationTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Sermons:</span>
                                            <span className="font-bold text-purple-900">{summary.totalSermons}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Articles:</span>
                                            <span className="font-bold text-purple-900">{summary.totalArticles}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reports List Summary */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Report History ({reports.length} reports)
                            </h2>
                            {reports.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No reports submitted for this month yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {reports.map((report) => (
                                        <div key={report.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800">
                                                    {new Date(report.date).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </h3>
                                                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                                                    {new Date(report.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Evangelism:</span>
                                                    <span className="font-semibold text-gray-800">{report.evangelism_hours || '0:00'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Reached:</span>
                                                    <span className="font-semibold text-gray-800">{report.people_reached || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bible Study:</span>
                                                    <span className="font-semibold text-gray-800">{report.bible_study_sessions || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MonthlyReport;
