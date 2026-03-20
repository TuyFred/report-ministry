const ReportFormTemplate = require('../models/ReportFormTemplate');

const DEFAULT_TEMPLATE_NAME = 'Default';

const defaultDefinition = {
    weekday: {
        visibleSections: [
            'ministryActivities',
            'bibleStudy',
            'spiritualDiscipline',
            'serviceAttendance',
            'serviceAttendanceExtras',
            'otherActivities'
        ],
        requiredFields: [
            'date', 'name', 'country', 'church',
            'evangelism_hours', 'people_reached', 'contacts_received',
            'bible_study_sessions', 'bible_study_attendants', 'newcomers',
            'meditation_hours', 'prayer_hours',
            'sermons_listened', 'articles_written'
        ]
    },
    weekend: {
        visibleSections: [
            'serviceAttendance',
            'sundayCoreMessage',
            'otherActivities',
            'planNextWeek'
        ],
        requiredFields: [
            'date', 'name', 'country', 'church',
            'regular_service',
            'sermon_reflection'
        ]
    },
    // Optional UI metadata used by the client to render labels/placeholders.
    // Backwards compatible: if missing, client falls back to built-in defaults.
    fields: {
        date: { label: 'Pick Date to Fill Data', placeholder: '' },
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
    }
};

async function ensureDefaultTemplate() {
    const existing = await ReportFormTemplate.findOne({ where: { name: DEFAULT_TEMPLATE_NAME } });
    if (existing) return existing;
    return ReportFormTemplate.create({
        name: DEFAULT_TEMPLATE_NAME,
        definition: defaultDefinition,
        is_active: true
    });
}

exports.getActive = async (req, res) => {
    try {
        let active = await ReportFormTemplate.findOne({ where: { is_active: true } });
        if (!active) {
            active = await ensureDefaultTemplate();
        }
        return res.json(active);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.list = async (req, res) => {
    try {
        const templates = await ReportFormTemplate.findAll({ order: [['createdAt', 'DESC']] });
        return res.json(templates);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, definition } = req.body;
        if (!name || !definition) {
            return res.status(400).json({ msg: 'name and definition are required' });
        }

        const created = await ReportFormTemplate.create({
            name,
            definition,
            is_active: false
        });

        return res.json(created);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const template = await ReportFormTemplate.findByPk(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });

        const { name, definition } = req.body;
        await template.update({
            name: typeof name === 'string' ? name : template.name,
            definition: definition ?? template.definition
        });

        return res.json(template);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const template = await ReportFormTemplate.findByPk(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });
        if (template.is_active) {
            return res.status(400).json({ msg: 'Cannot delete the active template. Activate another template first.' });
        }
        await template.destroy();
        return res.json({ msg: 'Deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.activate = async (req, res) => {
    try {
        const template = await ReportFormTemplate.findByPk(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });

        await ReportFormTemplate.update({ is_active: false }, { where: { is_active: true } });
        await template.update({ is_active: true });

        return res.json(template);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.getDefaults = async (req, res) => {
    try {
        return res.json({ name: DEFAULT_TEMPLATE_NAME, definition: defaultDefinition });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
    }
};
