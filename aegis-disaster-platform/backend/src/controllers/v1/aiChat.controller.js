import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';

const EMERGENCY_GUIDES = {
  flood: [
    'Move to higher ground immediately.',
    'Do not walk, swim or drive through flood waters.',
    'Turn off utilities at the main switches.',
    'Evacuate if told to do so.'
  ],
  fire: [
    'Get out, stay out, and call for help.',
    'If your clothes catch fire: Stop, Drop, and Roll.',
    'Stay low to the ground to avoid smoke.',
    'Feel doors for heat before opening.'
  ],
  earthquake: [
    'Drop, Cover, and Hold On.',
    'Stay away from windows and heavy furniture.',
    'If outdoors, move to an open area away from buildings.',
    'Do not use elevators.'
  ],
  general: [
    'Stay calm and follow official instructions.',
    'Ensure your emergency kit is ready.',
    'Listen to local radio or news for updates.'
  ]
};

export const getEmergencyGuidance = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const input = (message || '').toLowerCase();
  
  let type = 'general';
  if (input.includes('flood') || input.includes('water') || input.includes('drown')) type = 'flood';
  else if (input.includes('fire') || input.includes('smoke') || input.includes('burn')) type = 'fire';
  else if (input.includes('earthquake') || input.includes('shake') || input.includes('quake')) type = 'earthquake';

  const guidance = EMERGENCY_GUIDES[type];
  const response = {
    type,
    guidance,
    message: `Here are some immediate safety steps for ${type} situations.`
  };

  sendSuccess(res, response, 'Emergency guidance retrieved');
});
