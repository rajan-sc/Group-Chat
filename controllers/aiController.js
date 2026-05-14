const { getAutocomplete, getSmartReply } = require('../services/geminiService');

const autocomplete = async (req, res) => {
  try {
    const { partialText } = req.body;
    if (!partialText) return res.status(400).json({ error: 'partialText required' });

    const suggestion = await getAutocomplete(partialText);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ error: 'Error getting autocomplete' });
  }
};

const smartReply = async (req, res) => {
  try {
    const { recentMessages } = req.body;
    if (!recentMessages || !Array.isArray(recentMessages)) {
      return res.status(400).json({ error: 'recentMessages array required' });
    }

    const suggestion = await getSmartReply(recentMessages);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ error: 'Error getting smart reply' });
  }
};

module.exports = { autocomplete, smartReply };
