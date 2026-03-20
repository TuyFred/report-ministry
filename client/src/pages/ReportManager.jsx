import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../utils/api';

const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const SECTION_DEFS = [
    { key: 'ministryActivities', label: 'Ministry Activities' },
    { key: 'bibleStudy', label: 'Bible Study' },
    { key: 'spiritualDiscipline', label: 'Spiritual Discipline' },
    { key: 'serviceAttendance', label: 'Service Attendance' },
    { key: 'serviceAttendanceExtras', label: 'Service Attendance (Extras)' },
    { key: 'sundayCoreMessage', label: 'Sunday Service Core Message' },
    { key: 'otherActivities', label: 'Other Activities (Optional)' },
    { key: 'planNextWeek', label: 'Plan for Next Week (Optional)' }
];

const FIELD_DEFS = [
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
    { key: 'church', label: 'Church' },
    { key: 'evangelism_hours', label: 'Evangelism Hours' },
    { key: 'people_reached', label: 'People Reached' },
    { key: 'contacts_received', label: 'Contacts Received' },
    { key: 'newcomers', label: 'Newcomers' },
    { key: 'bible_study_sessions', label: 'Bible Study Sessions' },
    { key: 'bible_study_attendants', label: 'Bible Study Attendants' },
    { key: 'meditation_hours', label: 'Bible Reading and Meditation (Hours)' },
    { key: 'prayer_hours', label: 'Prayer (Hours)' },
    { key: 'regular_service', label: 'Service Attendance' },
    { key: 'sermons_listened', label: 'Sermons Listened' },
    { key: 'articles_written', label: 'Articles Written' },
    { key: 'sermon_reflection', label: 'Sunday Service Core Message' },
    { key: 'other_activities', label: 'Other Activities' },
    { key: 'tomorrow_tasks', label: 'Plan for Next Week' }
];

const DEFAULT_FIELD_META = {
    name: { label: 'Name', placeholder: 'Your Full Name' },
    country: { label: 'Country', placeholder: 'Search or select a country' },
    church: { label: 'Church Currently Serving At', placeholder: 'Church Name' },
    evangelism_hours: { label: 'Evangelism Hours', placeholder: 'Enter Hours' },
    people_reached: { label: 'People Reached', placeholder: 'Input Number' },
    contacts_received: { label: 'Contacts Received', placeholder: 'Input Number' },
    newcomers: { label: 'Newcomers', placeholder: 'Input Number' },
    bible_study_sessions: { label: 'Bible Study Sessions', placeholder: 'Number of Sessions' },
    bible_study_attendants: { label: 'Bible Study Attendants', placeholder: 'Input Number' },
    meditation_hours: { label: 'Bible Reading and Meditation (Hours)', placeholder: 'Enter Hours' },
    prayer_hours: { label: 'Prayer (Hours)', placeholder: 'Enter Hours' },
    regular_service: { label: 'Regular Service Type(s) - Select all that apply', placeholder: '' },
    sermons_listened: { label: 'Sermons or Bible Study Listened To', placeholder: 'Input Number' },
    articles_written: { label: 'Articles Written', placeholder: 'Input Number' },
    sermon_reflection: { label: 'Sunday Service Core Message', placeholder: 'Write the main points / core message...' },
    other_activities: { label: 'Other Activities (Optional)', placeholder: 'Describe any other activities, events, or tasks you did today (optional)...' },
    tomorrow_tasks: { label: 'Plan for Next Week (Optional)', placeholder: '1. \n2. \n3. ' }
};

const normalizeFields = (fields) => {
    const src = fields && typeof fields === 'object' ? fields : {};
    const out = { ...DEFAULT_FIELD_META };
    for (const key of Object.keys(src)) {
        const v = src[key];
        if (!v || typeof v !== 'object') continue;
        out[key] = {
            label: typeof v.label === 'string' ? v.label : (out[key]?.label || ''),
            placeholder: typeof v.placeholder === 'string' ? v.placeholder : (out[key]?.placeholder || '')
        };
    }
    return out;
};

const normalizeDefinition = (def) => {
    const weekday = def?.weekday || {};
    const weekend = def?.weekend || {};
    return {
        weekday: {
            visibleSections: Array.isArray(weekday.visibleSections) ? weekday.visibleSections : [],
            requiredFields: Array.isArray(weekday.requiredFields) ? weekday.requiredFields : []
        },
        weekend: {
            visibleSections: Array.isArray(weekend.visibleSections) ? weekend.visibleSections : [],
            requiredFields: Array.isArray(weekend.requiredFields) ? weekend.requiredFields : []
        },
        fields: normalizeFields(def?.fields)
    };
};

const toggleArrayValue = (arr, value) => {
    const existing = Array.isArray(arr) ? arr : [];
    return existing.includes(value) ? existing.filter(v => v !== value) : [...existing, value];
};

const buildDefinition = (draft) => ({
    weekday: {
        visibleSections: draft.weekday.visibleSections,
        requiredFields: draft.weekday.requiredFields
    },
    weekend: {
        visibleSections: draft.weekend.visibleSections,
        requiredFields: draft.weekend.requiredFields
    },
    fields: normalizeFields(draft.fields)
});

const PreviewField = ({ label, placeholder, isTextarea }) => (
    <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-gray-700">{label}</span>
        {isTextarea ? (
            <textarea
                disabled
                rows={2}
                className="w-56 px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm resize-none"
                placeholder={placeholder || '(preview)'}
            />
        ) : (
            <input
                disabled
                className="w-56 px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm"
                placeholder={placeholder || '(preview)'}
            />
        )}
    </div>
);

const SectionPreview = ({ title, children }) => (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <div className="grid grid-cols-1 gap-2">
            {children}
        </div>
    </div>
);

const ReportManager = () => {
    const { user } = useContext(AuthContext);

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [newName, setNewName] = useState('');
    const [newDraft, setNewDraft] = useState(() => normalizeDefinition({}));

    const [selectedId, setSelectedId] = useState('');
    const [editName, setEditName] = useState('');
    const [editDraft, setEditDraft] = useState(() => normalizeDefinition({}));

    const [previewMode, setPreviewMode] = useState('weekend');

    const fetchTemplates = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/report-forms`, {
                headers: { 'x-auth-token': token }
            });
            setTemplates(res.data || []);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to load templates' });
        } finally {
            setLoading(false);
        }
    };

    const loadDefaults = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/report-forms/defaults`, {
                headers: { 'x-auth-token': token }
            });
            setNewDraft(normalizeDefinition(res.data?.definition || {}));
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to load defaults' });
        }
    };

    const onCreate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const definition = buildDefinition(newDraft);
            await axios.post(`${API_URL}/api/report-forms`, { name: newName, definition }, {
                headers: { 'x-auth-token': token }
            });
            setNewName('');
            setNewDraft(normalizeDefinition({}));
            setMessage({ type: 'success', text: 'Template created' });
            await fetchTemplates();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to create template' });
        }
    };

    const onSelect = (id) => {
        setSelectedId(id);
        const t = templates.find(x => String(x.id) === String(id));
        if (!t) {
            setEditName('');
            setEditDraft(normalizeDefinition({}));
            return;
        }
        setEditName(t.name || '');
        setEditDraft(normalizeDefinition(t.definition || {}));
    };

    const onUpdate = async (e) => {
        e.preventDefault();
        if (!selectedId) return;
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const definition = buildDefinition(editDraft);
            await axios.put(`${API_URL}/api/report-forms/${selectedId}`, { name: editName, definition }, {
                headers: { 'x-auth-token': token }
            });
            setMessage({ type: 'success', text: 'Template updated' });
            await fetchTemplates();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update template' });
        }
    };

    const onActivate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/report-forms/${id}/activate`, {}, {
                headers: { 'x-auth-token': token }
            });
            setMessage({ type: 'success', text: 'Template activated (this replaces the current form)' });
            await fetchTemplates();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to activate template' });
        }
    };

    const onDelete = async (id) => {
        const ok = window.confirm('Delete this template? This cannot be undone.');
        if (!ok) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/report-forms/${id}`, {
                headers: { 'x-auth-token': token }
            });
            if (String(selectedId) === String(id)) {
                setSelectedId('');
                setEditName('');
                setEditDraft(normalizeDefinition({}));
            }
            setMessage({ type: 'success', text: 'Template deleted' });
            await fetchTemplates();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to delete template' });
        }
    };

    const previewDraft = useMemo(() => {
        return selectedId ? editDraft : newDraft;
    }, [selectedId, editDraft, newDraft]);

    const fieldText = useMemo(() => {
        const fields = previewDraft?.fields || {};
        return {
            label: (k, fallback) => {
                const v = fields?.[k]?.label;
                return typeof v === 'string' && v.trim() ? v : fallback;
            },
            placeholder: (k, fallback) => {
                const v = fields?.[k]?.placeholder;
                return typeof v === 'string' ? v : fallback;
            }
        };
    }, [previewDraft]);

    const previewConfig = useMemo(() => {
        return previewMode === 'weekend' ? previewDraft.weekend : previewDraft.weekday;
    }, [previewDraft, previewMode]);

    const previewSections = useMemo(() => {
        const order = SECTION_DEFS.map(s => s.key);
        const enabled = Array.isArray(previewConfig.visibleSections) ? previewConfig.visibleSections : [];
        return order.filter(k => enabled.includes(k));
    }, [previewConfig.visibleSections]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTemplates();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.role]);

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h1 className="text-2xl font-bold text-gray-900">Report Manager</h1>
                        <p className="text-gray-600 mt-2">Admin access required.</p>
                    </div>
                </div>
            </div>
        );
    }

    const activeTemplate = templates.find(t => t.is_active);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
                        <FaFileAlt className="text-indigo-600" />
                        Report Manager
                    </h1>
                    <p className="text-gray-600 mt-2">Create, edit, delete, and replace the report form used by members/leaders.</p>
                    <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-sm text-gray-600">Currently Active Form</p>
                        <p className="text-lg font-bold text-gray-900">{activeTemplate ? activeTemplate.name : 'None (will auto-create Default)'}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => scrollToId('rm-create-template')}
                            className="px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Create Template
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToId('rm-edit-template')}
                            className="px-3 py-2 text-xs font-bold rounded-lg bg-white border border-gray-200 hover:border-indigo-300"
                        >
                            Edit Template
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToId('rm-form-preview')}
                            className="px-3 py-2 text-xs font-bold rounded-lg bg-white border border-gray-200 hover:border-indigo-300"
                        >
                            Preview
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-800 border-2 border-green-200'
                            : 'bg-red-50 text-red-800 border-2 border-red-200'
                    }`}>
                        {message.type === 'success' && <FaCheckCircle className="text-green-600" />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Templates */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Templates</h2>
                            <button
                                type="button"
                                onClick={fetchTemplates}
                                disabled={loading}
                                className="px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-200 hover:border-indigo-300"
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {templates.length === 0 ? (
                                <p className="text-sm text-gray-600">No templates found.</p>
                            ) : (
                                templates.map(t => (
                                    <div key={t.id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(t.id)}
                                                className="text-left flex-1 min-w-0"
                                            >
                                                <p className="font-bold text-gray-900 truncate">{t.name}</p>
                                                <p className="text-xs text-gray-500">ID: {t.id}</p>
                                            </button>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {t.is_active ? (
                                                    <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-800">Active</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => onActivate(t.id)}
                                                        className="px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                                    >
                                                        Replace / Activate
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(t.id)}
                                                    className="px-3 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Note: You cannot delete the active form. Activate another one first.
                        </p>
                    </div>

                    {/* Create + Edit */}
                    <div className="space-y-6">
                        {/* Create */}
                        <div id="rm-create-template" className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Template</h2>
                            <form onSubmit={onCreate} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Country A Form"
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Form Builder</label>
                                        <button
                                            type="button"
                                            onClick={loadDefaults}
                                            className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                                        >
                                            Load Defaults
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <p className="font-bold text-gray-900 mb-2">Weekday Form</p>

                                            <p className="text-xs font-semibold text-gray-600 mb-2">Sections</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {SECTION_DEFS.filter(s => !['sundayCoreMessage', 'planNextWeek'].includes(s.key)).map(s => (
                                                    <label key={s.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={newDraft.weekday.visibleSections.includes(s.key)}
                                                            onChange={() => setNewDraft(d => ({
                                                                ...d,
                                                                weekday: {
                                                                    ...d.weekday,
                                                                    visibleSections: toggleArrayValue(d.weekday.visibleSections, s.key)
                                                                }
                                                            }))}
                                                        />
                                                        {s.label}
                                                    </label>
                                                ))}
                                            </div>

                                            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">Required Fields</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {FIELD_DEFS.filter(f => !['sermon_reflection', 'tomorrow_tasks'].includes(f.key)).map(f => (
                                                    <label key={f.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={newDraft.weekday.requiredFields.includes(f.key)}
                                                            onChange={() => setNewDraft(d => ({
                                                                ...d,
                                                                weekday: {
                                                                    ...d.weekday,
                                                                    requiredFields: toggleArrayValue(d.weekday.requiredFields, f.key)
                                                                }
                                                            }))}
                                                        />
                                                        {f.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <p className="font-bold text-gray-900 mb-2">Weekend Form</p>

                                            <p className="text-xs font-semibold text-gray-600 mb-2">Sections</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {SECTION_DEFS.filter(s => !['ministryActivities', 'bibleStudy', 'spiritualDiscipline', 'serviceAttendanceExtras'].includes(s.key)).map(s => (
                                                    <label key={s.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={newDraft.weekend.visibleSections.includes(s.key)}
                                                            onChange={() => setNewDraft(d => ({
                                                                ...d,
                                                                weekend: {
                                                                    ...d.weekend,
                                                                    visibleSections: toggleArrayValue(d.weekend.visibleSections, s.key)
                                                                }
                                                            }))}
                                                        />
                                                        {s.label}
                                                    </label>
                                                ))}
                                            </div>

                                            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">Required Fields</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {FIELD_DEFS.filter(f => ['date', 'name', 'country', 'church', 'regular_service', 'sermon_reflection'].includes(f.key)).map(f => (
                                                    <label key={f.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={newDraft.weekend.requiredFields.includes(f.key)}
                                                            onChange={() => setNewDraft(d => ({
                                                                ...d,
                                                                weekend: {
                                                                    ...d.weekend,
                                                                    requiredFields: toggleArrayValue(d.weekend.requiredFields, f.key)
                                                                }
                                                            }))}
                                                        />
                                                        {f.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 border border-gray-200 rounded-xl p-4">
                                        <p className="font-bold text-gray-900 mb-3">Field Labels & Placeholders</p>
                                        <p className="text-xs text-gray-600 mb-3">These control what members see on the Daily Report form.</p>

                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.keys(DEFAULT_FIELD_META).map((key) => (
                                                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                                                    <div className="text-sm font-semibold text-gray-800">{key}</div>
                                                    <input
                                                        type="text"
                                                        value={newDraft.fields?.[key]?.label || ''}
                                                        onChange={(e) => setNewDraft((d) => ({
                                                            ...d,
                                                            fields: {
                                                                ...(d.fields || {}),
                                                                [key]: {
                                                                    ...(d.fields?.[key] || {}),
                                                                    label: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="Label"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newDraft.fields?.[key]?.placeholder || ''}
                                                        onChange={(e) => setNewDraft((d) => ({
                                                            ...d,
                                                            fields: {
                                                                ...(d.fields || {}),
                                                                [key]: {
                                                                    ...(d.fields?.[key] || {}),
                                                                    placeholder: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="Placeholder"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                                >
                                    Create
                                </button>
                            </form>
                        </div>

                        {/* Edit */}
                        <div id="rm-edit-template" className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Template</h2>
                            <div className="mb-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Template</label>
                                <select
                                    value={selectedId}
                                    onChange={(e) => onSelect(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="">-- Select template --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <form onSubmit={onUpdate} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        disabled={!selectedId}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Form Builder</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`border border-gray-200 rounded-xl p-4 ${!selectedId ? 'bg-gray-100' : 'bg-white'}`}>
                                            <p className="font-bold text-gray-900 mb-2">Weekday Form</p>
                                            <p className="text-xs font-semibold text-gray-600 mb-2">Sections</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {SECTION_DEFS.filter(s => !['sundayCoreMessage', 'planNextWeek'].includes(s.key)).map(s => (
                                                    <label key={s.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!selectedId}
                                                            checked={editDraft.weekday.visibleSections.includes(s.key)}
                                                            onChange={() => setEditDraft(d => ({
                                                                ...d,
                                                                weekday: {
                                                                    ...d.weekday,
                                                                    visibleSections: toggleArrayValue(d.weekday.visibleSections, s.key)
                                                                }
                                                            }))}
                                                        />
                                                        {s.label}
                                                    </label>
                                                ))}
                                            </div>

                                            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">Required Fields</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {FIELD_DEFS.filter(f => !['sermon_reflection', 'tomorrow_tasks'].includes(f.key)).map(f => (
                                                    <label key={f.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!selectedId}
                                                            checked={editDraft.weekday.requiredFields.includes(f.key)}
                                                            onChange={() => setEditDraft(d => ({
                                                                ...d,
                                                                weekday: {
                                                                    ...d.weekday,
                                                                    requiredFields: toggleArrayValue(d.weekday.requiredFields, f.key)
                                                                }
                                                            }))}
                                                        />
                                                        {f.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={`border border-gray-200 rounded-xl p-4 ${!selectedId ? 'bg-gray-100' : 'bg-white'}`}>
                                            <p className="font-bold text-gray-900 mb-2">Weekend Form</p>
                                            <p className="text-xs font-semibold text-gray-600 mb-2">Sections</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {SECTION_DEFS.filter(s => !['ministryActivities', 'bibleStudy', 'spiritualDiscipline', 'serviceAttendanceExtras'].includes(s.key)).map(s => (
                                                    <label key={s.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!selectedId}
                                                            checked={editDraft.weekend.visibleSections.includes(s.key)}
                                                            onChange={() => setEditDraft(d => ({
                                                                ...d,
                                                                weekend: {
                                                                    ...d.weekend,
                                                                    visibleSections: toggleArrayValue(d.weekend.visibleSections, s.key)
                                                                }
                                                            }))}
                                                        />
                                                        {s.label}
                                                    </label>
                                                ))}
                                            </div>

                                            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">Required Fields</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {FIELD_DEFS.filter(f => ['date', 'name', 'country', 'church', 'regular_service', 'sermon_reflection'].includes(f.key)).map(f => (
                                                    <label key={f.key} className="flex items-center gap-2 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!selectedId}
                                                            checked={editDraft.weekend.requiredFields.includes(f.key)}
                                                            onChange={() => setEditDraft(d => ({
                                                                ...d,
                                                                weekend: {
                                                                    ...d.weekend,
                                                                    requiredFields: toggleArrayValue(d.weekend.requiredFields, f.key)
                                                                }
                                                            }))}
                                                        />
                                                        {f.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`mt-4 border border-gray-200 rounded-xl p-4 ${!selectedId ? 'bg-gray-100' : 'bg-white'}`}>
                                        <p className="font-bold text-gray-900 mb-3">Field Labels & Placeholders</p>
                                        <p className="text-xs text-gray-600 mb-3">These control what members see on the Daily Report form.</p>

                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.keys(DEFAULT_FIELD_META).map((key) => (
                                                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                                                    <div className="text-sm font-semibold text-gray-800">{key}</div>
                                                    <input
                                                        type="text"
                                                        disabled={!selectedId}
                                                        value={editDraft.fields?.[key]?.label || ''}
                                                        onChange={(e) => setEditDraft((d) => ({
                                                            ...d,
                                                            fields: {
                                                                ...(d.fields || {}),
                                                                [key]: {
                                                                    ...(d.fields?.[key] || {}),
                                                                    label: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                                        placeholder="Label"
                                                    />
                                                    <input
                                                        type="text"
                                                        disabled={!selectedId}
                                                        value={editDraft.fields?.[key]?.placeholder || ''}
                                                        onChange={(e) => setEditDraft((d) => ({
                                                            ...d,
                                                            fields: {
                                                                ...(d.fields || {}),
                                                                [key]: {
                                                                    ...(d.fields?.[key] || {}),
                                                                    placeholder: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                                        placeholder="Placeholder"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedId}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                                        !selectedId
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg'
                                    }`}
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        {/* Preview */}
                        <div id="rm-form-preview" className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Form Preview</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('weekday')}
                                        className={`px-3 py-2 text-xs font-bold rounded-lg border ${previewMode === 'weekday' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`}
                                    >
                                        Weekday
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('weekend')}
                                        className={`px-3 py-2 text-xs font-bold rounded-lg border ${previewMode === 'weekend' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`}
                                    >
                                        Weekend
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Preview shows the sections that members/leaders will see.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                {previewSections.length === 0 ? (
                                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-700">
                                        No sections selected yet.
                                    </div>
                                ) : (
                                    previewSections.map((key) => {
                                        const section = SECTION_DEFS.find(s => s.key === key);
                                        if (key === 'ministryActivities') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField label={fieldText.label('evangelism_hours', 'Evangelism Hours')} placeholder={fieldText.placeholder('evangelism_hours', 'Enter Hours')} />
                                                    <PreviewField label={fieldText.label('people_reached', 'People Reached')} placeholder={fieldText.placeholder('people_reached', 'Input Number')} />
                                                    <PreviewField label={fieldText.label('contacts_received', 'Contacts Received')} placeholder={fieldText.placeholder('contacts_received', 'Input Number')} />
                                                    <PreviewField label={fieldText.label('newcomers', 'Newcomers')} placeholder={fieldText.placeholder('newcomers', 'Input Number')} />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'bibleStudy') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField label={fieldText.label('bible_study_sessions', 'Bible Study Sessions')} placeholder={fieldText.placeholder('bible_study_sessions', 'Number of Sessions')} />
                                                    <PreviewField label={fieldText.label('bible_study_attendants', 'Bible Study Attendants')} placeholder={fieldText.placeholder('bible_study_attendants', 'Input Number')} />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'spiritualDiscipline') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField label={fieldText.label('meditation_hours', 'Bible Reading and Meditation (Hours)')} placeholder={fieldText.placeholder('meditation_hours', 'Enter Hours')} />
                                                    <PreviewField label={fieldText.label('prayer_hours', 'Prayer (Hours)')} placeholder={fieldText.placeholder('prayer_hours', 'Enter Hours')} />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'serviceAttendance') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField label={fieldText.label('regular_service', 'Regular Service Type(s) - Select all that apply')} placeholder={fieldText.placeholder('regular_service', '')} />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'serviceAttendanceExtras') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField label={fieldText.label('sermons_listened', 'Sermons or Bible Study Listened To')} placeholder={fieldText.placeholder('sermons_listened', 'Input Number')} />
                                                    <PreviewField label={fieldText.label('articles_written', 'Articles Written')} placeholder={fieldText.placeholder('articles_written', 'Input Number')} />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'sundayCoreMessage') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField
                                                        label={fieldText.label('sermon_reflection', 'Sunday Service Core Message')}
                                                        placeholder={fieldText.placeholder('sermon_reflection', 'Write the main points / core message...')}
                                                        isTextarea
                                                    />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'otherActivities') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField
                                                        label={fieldText.label('other_activities', 'Other Activities (Optional)')}
                                                        placeholder={fieldText.placeholder('other_activities', 'Describe any other activities, events, or tasks you did today (optional)...')}
                                                        isTextarea
                                                    />
                                                </SectionPreview>
                                            );
                                        }
                                        if (key === 'planNextWeek') {
                                            return (
                                                <SectionPreview key={key} title={section?.label || key}>
                                                    <PreviewField
                                                        label={fieldText.label('tomorrow_tasks', 'Plan for Next Week (Optional)')}
                                                        placeholder={fieldText.placeholder('tomorrow_tasks', '1. \n2. \n3. ')}
                                                        isTextarea
                                                    />
                                                </SectionPreview>
                                            );
                                        }
                                        return (
                                            <SectionPreview key={key} title={section?.label || key}>
                                                <PreviewField label="(section)" placeholder="(preview)" />
                                            </SectionPreview>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportManager;
