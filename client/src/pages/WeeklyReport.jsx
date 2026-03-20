import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarWeek, FaFilePdf, FaFileExcel, FaChevronLeft, FaChevronRight, FaUsers, FaClock, FaBook, FaPray, FaChurch, FaHeart } from 'react-icons/fa';

const WeeklyReport = () => {
    const { user } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [weekDates, setWeekDates] = useState({ start: '', end: '' });
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
        completionRate: 0
    });

    useEffect(() => {
        calculateWeekDates();
    }, [selectedDate]);

    useEffect(() => {
        if (weekDates.start && weekDates.end) {
            fetchWeeklyReports();
        }
    }, [weekDates]);

    const calculateWeekDates = () => {
        const curr = new Date(selectedDate);
        const first = curr.getDate() - curr.getDay(); // Sunday
        const last = first + 6; // Saturday
        
        const startDate = new Date(curr.setDate(first));
        const endDate = new Date(curr.setDate(last));
        
        setWeekDates({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });
    };

    const fetchWeeklyReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = { 
                startDate: weekDates.start, 
                endDate: weekDates.end,
                userId: user.id // Only fetch current user's reports
            };

            const response = await axios.get(`${API_URL}/api/reports`, {
                headers: { 'x-auth-token': token },
                params: params
            });

            const weekReports = response.data;
            setReports(weekReports);
            calculateSummary(weekReports);
        } catch (error) {
            console.error('Error fetching weekly reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (reportsList) => {
        const totalReports = reportsList.length;
        const expectedReports = 7; // 7 days in a week

        const totals = reportsList.reduce((acc, report) => {
            // Parse time values (stored as hours)
            const parseTime = (timeValue) => {
                if (!timeValue) return 0;
                // Handle if it's already a number (hours)
                if (typeof timeValue === 'number') return timeValue;
                // Handle if it's a string number
                const parsed = parseFloat(timeValue);
                if (isNaN(parsed)) return 0;
                return parsed;
            };

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

        setSummary({
            totalReports,
            ...totals,
            avgEvangelismPerDay: totalReports > 0 ? (totals.totalEvangelismHours / totalReports).toFixed(2) : 0,
            avgPeopleReachedPerDay: totalReports > 0 ? (totals.totalPeopleReached / totalReports).toFixed(1) : 0,
            completionRate: ((totalReports / expectedReports) * 100).toFixed(1)
        });
    };

    const formatHours = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    const handlePreviousWeek = () => {
        const curr = new Date(selectedDate);
        curr.setDate(curr.getDate() - 7);
        setSelectedDate(curr.toISOString().split('T')[0]);
    };

    const handleNextWeek = () => {
        const curr = new Date(selectedDate);
        curr.setDate(curr.getDate() + 7);
        setSelectedDate(curr.toISOString().split('T')[0]);
    };

    const handleExport = async (type) => {
        try {
            const token = localStorage.getItem('token');
            const params = {
                startDate: weekDates.start,
                endDate: weekDates.end,
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
            link.setAttribute('download', `weekly_report_${weekDates.start}.${extension}`);
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            alert(`Weekly report exported successfully as ${extension.toUpperCase()}!`);
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
                                <FaCalendarWeek className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Weekly Report Summary</h1>
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

                    {/* Week Navigator */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button 
                            onClick={handlePreviousWeek}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Week of</p>
                            <p className="text-lg font-bold text-gray-800">
                                {new Date(weekDates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {' - '}
                                {new Date(weekDates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <button 
                            onClick={handleNextWeek}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading weekly report...</p>
                    </div>
                ) : (
                    <>
                        {/* Completion Status */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Report Completion</h2>
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
                                {summary.totalReports} out of 7 daily reports submitted this week
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Evangelism */}
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaUsers className="text-3xl opacity-80" />
                                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                                        Avg: {summary.avgPeopleReachedPerDay}/day
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{summary.totalPeopleReached}</h3>
                                <p className="text-blue-100 text-sm">People Reached</p>
                                <p className="text-xs text-blue-200 mt-2">{formatHours(summary.totalEvangelismHours)} total</p>
                            </div>

                            {/* Bible Study */}
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaBook className="text-3xl opacity-80" />
                                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                                        {summary.totalBibleStudySessions} Sessions
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{summary.totalBibleStudyAttendants}</h3>
                                <p className="text-green-100 text-sm">Bible Study Attendants</p>
                                <p className="text-xs text-green-200 mt-2">{summary.totalNewcomers} newcomers</p>
                            </div>

                            {/* Prayer & Meditation */}
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaPray className="text-3xl opacity-80" />
                                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                                        Spiritual
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{formatHours(summary.totalPrayerTime)}</h3>
                                <p className="text-purple-100 text-sm">Prayer Time</p>
                                <p className="text-xs text-purple-200 mt-2">{formatHours(summary.totalMeditationTime)} meditation</p>
                            </div>

                            {/* Service Attendance */}
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <FaChurch className="text-3xl opacity-80" />
                                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                                        Services
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{summary.morningServiceAttendance + summary.regularServiceAttendance}</h3>
                                <p className="text-orange-100 text-sm">Total Attendance</p>
                                <p className="text-xs text-orange-200 mt-2">
                                    {summary.morningServiceAttendance} morning, {summary.regularServiceAttendance} regular
                                </p>
                            </div>
                        </div>

                        {/* Detailed Statistics */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Statistics</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ministry Activities */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                        <FaUsers className="text-indigo-600" />
                                        Ministry Activities
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Evangelism Hours:</span>
                                            <span className="font-bold text-indigo-900">{formatHours(summary.totalEvangelismHours)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">People Reached:</span>
                                            <span className="font-bold text-indigo-900">{summary.totalPeopleReached}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Contacts Received:</span>
                                            <span className="font-bold text-indigo-900">{summary.totalContacts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Avg Per Day:</span>
                                            <span className="font-bold text-indigo-900">{summary.avgEvangelismPerDay}h</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bible Study */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                                        <FaBook className="text-green-600" />
                                        Bible Study
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Sessions:</span>
                                            <span className="font-bold text-green-900">{summary.totalBibleStudySessions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Attendants:</span>
                                            <span className="font-bold text-green-900">{summary.totalBibleStudyAttendants}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Unique Attendants:</span>
                                            <span className="font-bold text-green-900">{summary.totalUniqueAttendants}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Newcomers:</span>
                                            <span className="font-bold text-green-900">{summary.totalNewcomers}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Spiritual Disciplines */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                                        <FaPray className="text-purple-600" />
                                        Spiritual Disciplines
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Meditation Time:</span>
                                            <span className="font-bold text-purple-900">{formatHours(summary.totalMeditationTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Prayer Time:</span>
                                            <span className="font-bold text-purple-900">{formatHours(summary.totalPrayerTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Sermons Listened:</span>
                                            <span className="font-bold text-purple-900">{summary.totalSermons}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Articles Written:</span>
                                            <span className="font-bold text-purple-900">{summary.totalArticles}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Health */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl">
                                    <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                                        <FaHeart className="text-orange-600" />
                                        Health & Attendance
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Exercise Time:</span>
                                            <span className="font-bold text-orange-900">{formatHours(summary.totalExerciseTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Morning Services:</span>
                                            <span className="font-bold text-orange-900">{summary.morningServiceAttendance} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Regular Services:</span>
                                            <span className="font-bold text-orange-900">{summary.regularServiceAttendance} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Attendance:</span>
                                            <span className="font-bold text-orange-900">
                                                {summary.morningServiceAttendance + summary.regularServiceAttendance} times
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Breakdown */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Breakdown</h2>
                            {reports.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No reports submitted for this week yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map((report) => (
                                        <div key={report.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">
                                                        {new Date(report.date).toLocaleDateString('en-US', { 
                                                            weekday: 'long', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{report.church}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                                                    {new Date(report.date).getDay() === 0 || new Date(report.date).getDay() === 6 ? 'Weekend' : 'Weekday'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Evangelism</p>
                                                    <p className="font-bold text-gray-800">{report.evangelism_hours || '0:00'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">People Reached</p>
                                                    <p className="font-bold text-gray-800">{report.people_reached || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Bible Study</p>
                                                    <p className="font-bold text-gray-800">{report.bible_study_sessions || 0} sessions</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Prayer Time</p>
                                                    <p className="font-bold text-gray-800">{report.prayer_time || '0:00'}</p>
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

export default WeeklyReport;
